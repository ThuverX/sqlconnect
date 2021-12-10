import { CustomBuffer } from "../../Helper/CustomBuffer";
import { ReadFlagsFromInt } from "../../Helper/Helper";
import { FieldFlag } from "../FieldFlags";
import { ExtendedCapabilityFlag, CapabilityFlag } from "../MYSQLCapabilities";
import { FieldType } from "../MYSQLFieldType";
import { ServerStatusFlag } from "../ServerStatusFlags";

export enum ClientBoundPacketID {
    HANDSHAKE,
    RESPONSE_COLUMN_DEFINITION,
}

export function ConstructClientBoundPacket<T>(type: ClientBoundPacketID, buf: CustomBuffer): T {
    switch(type) {
        case ClientBoundPacketID.HANDSHAKE: return ConstructClientBoundHandshakePacket(buf) as any
        case ClientBoundPacketID.RESPONSE_COLUMN_DEFINITION: return ConstructClientBoundResponseColumnDefinitionPacket(buf) as any
    }
}

export type ClientBoundHandshakePacket = ReturnType<typeof ConstructClientBoundHandshakePacket>
function ConstructClientBoundHandshakePacket(buf: CustomBuffer): {
    protocolVersion: number,
    serverVersion: string,
    connectionId: number,
    salt: [string, string | null],
    serverCapabilities: Set<CapabilityFlag>,
    characterSet: number,
    serverStatusFlags: Set<ServerStatusFlag>,
    extendedServerCapabilities: Set<ExtendedCapabilityFlag>,
    authPluginDataLength: number | null,
    authenticationPluginName: string | null
} {
    buf.jump(4)
    let protocolVersion: number = buf.readUInt(1)

    let serverVersion: string = buf.readString('NUL')
    let connectionId: number = buf.readUInt(4)
    let authenticationSeed: string = buf.readString(8)
    buf.jump(1)

    let serverCapabilitiesFlag: number = buf.readUInt(2)
    let characterSet: number = buf.readUInt(1)
    let serverStatusFlags = ReadFlagsFromInt<ServerStatusFlag>(buf.readUInt(2),ServerStatusFlag)
    let extendedServerCapabilitiesFlag: number = buf.readUInt(2)
    let authPluginDataLength: number | null = null

    let serverCapabilities: Set<CapabilityFlag> = new Set(ReadFlagsFromInt<CapabilityFlag>(serverCapabilitiesFlag,CapabilityFlag))
    let extendedServerCapabilities: Set<ExtendedCapabilityFlag> = new Set(ReadFlagsFromInt<ExtendedCapabilityFlag>(extendedServerCapabilitiesFlag,ExtendedCapabilityFlag))
    let scramblePart2: string | null = null
    let authenticationPluginName: string | null = null

    if(extendedServerCapabilities.has(ExtendedCapabilityFlag.CLIENT_PLUGIN_AUTH)) {
        authPluginDataLength = buf.readUInt(1)
    }
    else buf.jump(1)

    buf.jump(10)

    if(serverCapabilities.has(CapabilityFlag.CLIENT_SECURE_CONNECTION)) {
        let length = Math.max(12, authPluginDataLength! - 9)
        scramblePart2 = buf.readString(length)
        buf.jump(1)
    }

    if(extendedServerCapabilities.has(ExtendedCapabilityFlag.CLIENT_PLUGIN_AUTH))  {
        authenticationPluginName = buf.readString('NUL')
    }

    return {
        protocolVersion,
        serverVersion,
        connectionId,
        salt: [authenticationSeed, scramblePart2],
        serverCapabilities,
        characterSet,
        serverStatusFlags: new Set(serverStatusFlags),
        extendedServerCapabilities,
        authPluginDataLength,
        authenticationPluginName
    }
}

export type ClientBoundResponseColumnDefinitionPacket = ReturnType<typeof ConstructClientBoundResponseColumnDefinitionPacket>
function ConstructClientBoundResponseColumnDefinitionPacket(buf: CustomBuffer): {
    catalog: string,
    database: string,
    table: string,
    o_table: string,
    name: string,
    o_name: string,
    charset: number,
    length: number,
    type: FieldType,
    flags: Set<FieldFlag>,
    decimals: number
} {
    buf.jump(4)

    let catalog = buf.readLengthEncodedString()
    let database = buf.readLengthEncodedString()
    let table = buf.readLengthEncodedString()
    let o_table = buf.readLengthEncodedString()
    let name = buf.readLengthEncodedString()
    let o_name = buf.readLengthEncodedString()
    
    buf.jump(1)

    let charset = buf.readUInt(1)

    buf.jump(1)

    let length = buf.readUInt()
    let type = buf.readUInt(1)

    let flags = new Set(ReadFlagsFromInt<FieldFlag>(buf.readUInt(2),FieldFlag))

    let decimals = buf.readUInt(1)

    return {
        catalog,
        database,
        table,
        o_table,
        name,
        o_name,
        charset,
        length,
        type,
        flags,
        decimals 
    }

}