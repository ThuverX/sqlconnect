import { Default, Maybe } from '../Helper/Helper'
import { createConnection, Socket} from 'net'
import { AlreadyConnectedError, NotYetConnectedError } from './Errors'
import { CustomBuffer, Endianness } from '../Helper/CustomBuffer'
import { ExtendedCapabilityFlag, CapabilityFlag } from './MYSQLCapabilities'
import { ClientBoundHandshakePacket, ClientBoundPacketID, ClientBoundResponseColumnDefinitionPacket, ConstructClientBoundPacket } from './Packets/ClientBound'
import { ConstructServerBoundPacket, HandShakeOptions, ServerBoundPacketID } from './Packets/ServerBound'
import { SendPacket } from './PacketSender'
import { EventEmitter } from 'events'
import { QueryBuilder } from './Querybuilder'
import { ConvertFieldWithType } from './MYSQLFieldType'
import { PreparedStatement } from './PreparedStatement'

export type HostnameLike = string
export enum ConnectionStatus {
    DISCONNECTED = 'disconnected',
    PREPARING = 'preparing',
    HANDSHAKING = 'handshaking',
    CONNECTED = 'connected'
}

export interface CompleteMYSQLConnectionOptions extends MYSQLConnectionOptions {
    password: string,
    port: number
}

export interface MYSQLConnectionOptions {
    hostname: HostnameLike,
    user: string,
    password?: string,
    port?: number,
    database?: string | null
}

export class MYSQLConnection extends QueryBuilder {

    public static DefaultMYSQLConnectionOptions: MYSQLConnectionOptions = {
        hostname: 'localhost',
        user: 'root',
        password: '',
        port: 3306,
        database: null
    }

    private _listener: EventEmitter = new EventEmitter()
    private options: CompleteMYSQLConnectionOptions
    private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED
    private socketConnection: Maybe<Socket>

    private serverTimeout: number = 10e3
    private _debug: boolean = false

    constructor(options: MYSQLConnectionOptions) {
        super()
        this.options = Default(options, MYSQLConnection.DefaultMYSQLConnectionOptions)
    }
    
    public connect(): Promise<MYSQLConnection> {
        if(this.connectionStatus == ConnectionStatus.CONNECTED) throw new AlreadyConnectedError()

        return new Promise<MYSQLConnection>((res) => {
            this.socketConnection = createConnection(this.options.port, this.options.hostname, () => {
                this._listener.once('READY_AND_CONNECTED', () => res(this))
            })

            this.socketConnection.on('connect', this.onConnect.bind(this))
            this.socketConnection.on('close', this.onClose.bind(this))
            this.socketConnection.on('error', this.onError.bind(this))
            this.socketConnection.on('data', this.onData.bind(this))
        })
    }

    private onError(error: Error) {
        throw error
    }

    private onConnect() {
        this.connectionStatus = ConnectionStatus.PREPARING

        if(this._debug)
            console.log('MYSQLConnection::PREPARING')
    }

    private onClose() {
        this.connectionStatus = ConnectionStatus.DISCONNECTED

        if(this._debug)
            console.log('MYSQLConnection::DISCONNECTED')
    }

    private onData(buffer: Buffer) {
        let buf = new CustomBuffer(buffer, Endianness.LITTLE_ENDIAN)

        if(this.connectionStatus == ConnectionStatus.PREPARING) {
            let serverHandShakeData = ConstructClientBoundPacket<ClientBoundHandshakePacket>(ClientBoundPacketID.HANDSHAKE, buf)

            let handshakeOptions: HandShakeOptions = {
                username: this.options.user,
                password: this.options.password,
                clientcapabilities: new Set([
                    CapabilityFlag.CLIENT_LONG_PASSWORD,
                    CapabilityFlag.CLIENT_LONG_FLAG,
                    CapabilityFlag.CLIENT_LOCAL_FILES,
                    CapabilityFlag.CLIENT_TRANSACTIONS,
                    CapabilityFlag.CLIENT_INTERACTIVE,
                    CapabilityFlag.CLIENT_SECURE_CONNECTION,
                    CapabilityFlag.CLIENT_PROTOCOL_41,
                ]),
                extendedClientcapabilities: new Set([
                    ExtendedCapabilityFlag.CLIENT_MULTI_STATEMENTS,
                    ExtendedCapabilityFlag.CLIENT_MULTI_RESULTS,
                    ExtendedCapabilityFlag.CLIENT_PS_MULTI_RESULTS,
                    ExtendedCapabilityFlag.CLIENT_PLUGIN_AUTH,
                    // ExtendedCapabilityFlag.CLIENT_CONNECT_ATTRS,
                    ExtendedCapabilityFlag.CLIENT_CAN_HANDLE_EXPIRED_PASSWORDS,
                    ExtendedCapabilityFlag.CLIENT_SESSION_TRACK
                ])
            }

            if(this.options.database)
                handshakeOptions.clientcapabilities.add(CapabilityFlag.CLIENT_CONNECT_WITH_DB)

            if(serverHandShakeData.authenticationPluginName)
                handshakeOptions.authplugin = serverHandShakeData.authenticationPluginName

            if(this.options.database)
                handshakeOptions.database = this.options.database

            let clientHandShakeReply = ConstructServerBoundPacket(ServerBoundPacketID.HANDSHAKE, handshakeOptions)

            SendPacket(this.socketConnection!, clientHandShakeReply, 1)

            this.connectionStatus = ConnectionStatus.HANDSHAKING
            if(this._debug)
                console.log('MYSQLConnection::HANDSHAKING')

            return
        }

        buf.jump(4, true)
        
        let byteswitch = buf.readUInt(1)

        if(byteswitch > 0x00 && byteswitch < 0xff) return this.handleResponse(buf, byteswitch)
        else if(byteswitch == 0x00) return this.handleOk()
        else if(byteswitch == 0xff) return this.handleError(buf)
    }

    private handleResponse(buf: CustomBuffer, fieldsAmount: number): void {
        let fields: Array<ClientBoundResponseColumnDefinitionPacket> = []
        let output: Array<any> = []

        for(let i = 0; i < fieldsAmount; i++) {
            let data = ConstructClientBoundPacket<ClientBoundResponseColumnDefinitionPacket>(ClientBoundPacketID.RESPONSE_COLUMN_DEFINITION, buf)

            fields.push(data)

            buf.jump(2)
        }

        buf.jump(9)

        while(true) {
            buf.jump(4)

            let data: any[] = []

            if(buf.readUInt(1) == 0xfe) break;
            buf.jump(-1)

            for(let i = 0; i < fieldsAmount; i++) {
                console.log(fields[i])
                let dataString = buf.readLengthEncodedString()
                let dataWithType = ConvertFieldWithType(fields[i].type, dataString)
                data.push(dataWithType)
            }

            output.push(
                fields.reduce<any>((pre, cur, i) => {
                    pre[cur.name] = data[i]
                    return pre
                }, {})
            )
        }

        this._listener.emit('MYSQL_RESPONSE', output)
    }

    private handleError(buf: CustomBuffer): void {
        let error_string = buf.getBytes().slice(13).toString()

        this._listener.emit('MYSQL_ERROR', error_string)

        if(this._debug)
            console.log('MYSQLConnection::ERROR("' + error_string + '")')
    }

    private handleOk(): void {
        if(this.connectionStatus == ConnectionStatus.HANDSHAKING) {
            this.connectionStatus = ConnectionStatus.CONNECTED

            if(this._debug)
                console.log('MYSQLConnection::CONNECTED')

            this._listener.emit('READY_AND_CONNECTED')

            return
        }

        this._listener.emit('MYSQL_OK', {
            OK: true
        })
    }

    public __perform_query(query: string): Promise<Array<any>> {
        this.CHECK_IfConnected()

        return new Promise((res, rej) => {
            let queryPacket = ConstructServerBoundPacket(ServerBoundPacketID.COM_QUERY, {
                query
            })

            SendPacket(this.socketConnection!, queryPacket, 0).then(() => {
                let isResolved = false

                let timeout = setTimeout(() => {
                    if(isResolved) return
                    isResolved = true

                    rej(`Error on query: "${query}"; Server took too long to respond`)
                }, this.serverTimeout)

                this._listener.once('MYSQL_ERROR', function(error){
                    if(isResolved) return
                    isResolved = true

                    clearTimeout(timeout)

                    rej('MYSQL ERROR: \nQuery: ' + query + '\nError: ' + error)
                })

                this._listener.once('MYSQL_RESPONSE', function(result){
                    if(isResolved) return
                    isResolved = true
                    
                    clearTimeout(timeout)

                    res(result)
                })

                this._listener.once('MYSQL_OK', function(result){
                    if(isResolved) return
                    isResolved = true
                    
                    clearTimeout(timeout)

                    res(result)
                })
            })
        })
    }

    public use(database: string): Promise<any> {
        this.options.database = database
        return this.__perform_query(`USE \`${database}\`;`)
    }

    public prepare(): Promise<PreparedStatement> {
        return new PreparedStatement(this.buildQuery(), this).emit()
    }

    public get(): Promise<any> {
        return this.__perform_query(this.buildQuery())
    }

    public done(): Promise<any> {
        return this.__perform_query(this.buildQuery())
    }

    private CHECK_IfConnected() {
        if(this.connectionStatus == ConnectionStatus.DISCONNECTED) throw new NotYetConnectedError()
    }

    public disconnect() {
        this.CHECK_IfConnected()

        this.socketConnection?.destroy()

        this.connectionStatus = ConnectionStatus.DISCONNECTED
    }
}