import { CustomBuffer, Endianness } from "../Helper/CustomBuffer"
import { Socket } from "net"

export function SendPacket(socket: Socket, buf: CustomBuffer, sequenceNumber: number): Promise<void> {
    return new Promise((res, rej) => {
        let sequenceId = sequenceNumber
        let packetSize = buf.getSize()

        let outBuffer = new CustomBuffer(Buffer.alloc(buf.getSize() + 4), Endianness.LITTLE_ENDIAN)

        buf.getBytes().copy(outBuffer.getBytes(), 4)

        outBuffer.jump(0, true)

        outBuffer.writeUInt(packetSize,3)
        outBuffer.writeUInt(sequenceId, 1)
        
        socket.write(outBuffer.getBytes(),(err) => {
            if(err) rej(err)
            else res()
        })
    })
}
