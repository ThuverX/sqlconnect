import { CustomBuffer, Endianness } from "../../Helper/CustomBuffer";
import { Default, WriteFlagsToInt } from "../../Helper/Helper";
import { ExtendedCapabilityFlag, CapabilityFlag } from "../MYSQLCapabilities";

export enum ServerBoundPacketID {
    HANDSHAKE,
    COM_QUERY
}

export function ConstructServerBoundPacket(type: ServerBoundPacketID, options: any): CustomBuffer {
    switch(type) {
        case ServerBoundPacketID.HANDSHAKE: return ConstructServerBoundHandshakePacket(options)
        case ServerBoundPacketID.COM_QUERY: return ConstructServerBoundQueryPacket(options)
    }
}

export interface HandShakeOptions {
    use_ssl?: boolean,
    charset?: number,
    username?: string,
    database?: string,
    password?: string,
    authplugin?: string,
    connection_attributes?: {[key:string]: string},
    clientcapabilities: Set<CapabilityFlag>,
    extendedClientcapabilities: Set<ExtendedCapabilityFlag>
}

const DefaultHandShakeOptions: HandShakeOptions = {
    use_ssl: false,
    charset: 8,
    username: 'root',
    password: '',
    authplugin: '',
    clientcapabilities: new Set(),
    extendedClientcapabilities: new Set(),
}

function ConstructServerBoundHandshakePacket(options: HandShakeOptions): CustomBuffer {
    options = Default(options, DefaultHandShakeOptions)

    let buf = new CustomBuffer(Endianness.LITTLE_ENDIAN)

    if(options.use_ssl) {
        throw 'Not yet implemented'
    } else {
        let clientCapabilityFlagInt = WriteFlagsToInt<CapabilityFlag>([...options.clientcapabilities!])
        let extendedClientCapabilityFlagInt = WriteFlagsToInt<ExtendedCapabilityFlag>([...options.extendedClientcapabilities!])

        buf.writeUInt(clientCapabilityFlagInt, 2)
        buf.writeUInt(extendedClientCapabilityFlagInt, 2)
        buf.writeUInt(0x40000000)
        buf.writeUInt(options.charset!, 1)

        buf.fill(23)

        buf.writeString(options.username!, true)

        if(options.extendedClientcapabilities!.has(ExtendedCapabilityFlag.CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA)) {
            buf.writeLengthEncodedString(options.password!)
        } else if(options.clientcapabilities!.has(CapabilityFlag.CLIENT_SECURE_CONNECTION)) {
            buf.writeUInt(options.password!.length, 1)
            buf.writeString(options.password!)
        } else {
            buf.writeString(options.password!, true)
        }

        if(options.clientcapabilities!.has(CapabilityFlag.CLIENT_CONNECT_WITH_DB) && options.database) {
            buf.writeString(options.database, true)
        }

        if(options.extendedClientcapabilities!.has(ExtendedCapabilityFlag.CLIENT_PLUGIN_AUTH)) {
            buf.writeString(options.authplugin!, true)
        }

        // if(options.servercapabilities!.has(ServerCapabilityFlag.CLIENT_CONNECT_ATTRS) && options.connection_attributes) {
        //     buf.writeString(options.authplugin!, true)
        // }
    }

    return buf
}

export interface QueryOptions {
    query: string
}

function ConstructServerBoundQueryPacket(options: QueryOptions): CustomBuffer {
    let buf = new CustomBuffer(Endianness.LITTLE_ENDIAN)

    buf.writeUInt(3,1)
    buf.writeString(options.query)

    return buf
}