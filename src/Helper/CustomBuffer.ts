export enum Endianness {
    BIG_ENDIAN,
    LITTLE_ENDIAN
}

export class CustomBuffer {

    private pointer: number = 0
    private buffer: Buffer = Buffer.alloc(4)
    public endianness: Endianness = Endianness.BIG_ENDIAN

    constructor(buffer?: Buffer | Endianness, endianness: Endianness = Endianness.BIG_ENDIAN) {
        if(buffer && (buffer as Buffer).fill) {
            this.buffer = buffer as Buffer
            this.endianness = endianness
        } else if(buffer && typeof buffer == 'number') {
            this.endianness = buffer as Endianness
        }
    }

    public jump(size: number, absolute: boolean = false): void {
        if(absolute) this.pointer = size
        else this.pointer += size
    }

    public fill(size: number) {
        this.grow(size)
        this.pointer += size
    }

    public grow(size: number): void {
        let tempbuf: Buffer = Buffer.alloc(this.buffer.byteLength + size)
        this.buffer.copy(tempbuf)
        this.buffer = tempbuf
    }

    private growIfNecessary(size: number): void {
        if(this.pointer + size > this.buffer.byteLength)
            this.grow(this.pointer - this.buffer.byteLength + size)
    }

    public readInt(size: number = 4) : number {
        if(size == 1) {
            let ret = this.buffer.readInt8(this.pointer)
            this.pointer++
            return ret
        }

        if(this.endianness == Endianness.BIG_ENDIAN) return this.readIntBE(size)
        else return this.readIntLE(size)
    }

    public readUInt(size: number = 4) : number {
        if(size == 1) {
            let ret = this.buffer.readUInt8(this.pointer)
            this.pointer++
            return ret
        }

        if(this.endianness == Endianness.BIG_ENDIAN) return this.readUIntBE(size)
        else return this.readUIntLE(size)
    }

    public readUIntBE(size: number): number {
        if(size == 4) {
            let ret = this.buffer.readUInt32BE(this.pointer)
            this.pointer += 4
            return ret
        } else if(size == 3) {
            let ret = this.buffer[this.pointer + 2] + (this.buffer[this.pointer + 1] << 8) + (this.buffer[this.pointer] << 16)
            this.pointer += 3
            return ret
        } else {
            let ret = this.buffer.readUInt16BE(this.pointer)
            this.pointer += 2
            return ret
        }
    }

    public readUIntLE(size: number): number {
        if(size == 4) {
            let ret = this.buffer.readUInt32LE(this.pointer)
            this.pointer += 4
            return ret
        } else if(size == 3) {
            let ret = this.buffer[this.pointer] + (this.buffer[this.pointer + 1] << 8) + (this.buffer[this.pointer + 2] << 16)
            this.pointer += 3
            return ret
        } else {
            let ret = this.buffer.readUInt16LE(this.pointer)
            this.pointer += 2
            return ret
        }
    }

    public writeInt(value: number, size: number = 4): void {
        this.growIfNecessary(size)

        if(size == 1) {
            this.buffer.writeInt8(value, this.pointer)
            this.pointer++
        }
        else if(this.endianness == Endianness.BIG_ENDIAN) this.writeIntBE(value, size)
        else this.writeIntLE(value, size)
    }

    public writeUInt(value: number, size: number = 4): void {
        this.growIfNecessary(size)

        if(size == 1) {
            this.buffer.writeUInt8(value, this.pointer)
            this.pointer++
        }
        else if(this.endianness == Endianness.BIG_ENDIAN) this.writeUIntBE(value, size)
        else this.writeUIntLE(value, size)
    }

    public writeUIntBE(value: number, size: number): void {
        if(size == 4) {
            this.buffer.writeUInt32BE(value, this.pointer)
            this.pointer += 4
        } else if(size == 2) {
            this.buffer.writeUInt16BE(value, this.pointer)
            this.pointer += 2
        } else {
            this.buffer.writeUInt16BE(value >> 8, this.pointer)
            this.buffer.writeUInt8(value & 255, this.pointer + 2)
            this.pointer += 3
        }
    }

    public writeUIntLE(value: number, size: number): void {
        if(size == 4) {
            this.buffer.writeUInt32LE(value, this.pointer)
            this.pointer += 4
        } else if(size == 2) {
            this.buffer.writeUInt16LE(value, this.pointer)
            this.pointer += 2
        } else {
            this.buffer.writeUInt8(value & 255, this.pointer)
            this.buffer.writeUInt16LE(value >> 8, this.pointer + 2)
            this.pointer += 3
        }
    }

    public writeIntBE(value: number, size: number): void {
        if(size == 4) {
            this.buffer.writeInt32BE(value, this.pointer)
            this.pointer += 4
        } else if(size == 2) {
            this.buffer.writeInt16BE(value, this.pointer)
            this.pointer += 2
        } else {
            this.buffer.writeInt16BE(value >> 8, this.pointer)
            this.buffer.writeInt8(value & 255, this.pointer + 2)
            this.pointer += 3
        }
    }

    public writeIntLE(value: number, size: number): void {
        if(size == 4) {
            this.buffer.writeInt32LE(value, this.pointer)
            this.pointer += 4
        } else if(size == 2) {
            this.buffer.writeInt16LE(value, this.pointer)
            this.pointer += 2
        } else {
            this.buffer.writeInt8(value & 255, this.pointer)
            this.buffer.writeInt16LE(value >> 8, this.pointer + 2)
            this.pointer += 3
        }
    }

    public readIntBE(size: number): number {
        if(size == 4) {
            let ret = this.buffer.readInt32BE(this.pointer)
            this.pointer += 4
            return ret
        } else if(size == 3) {
            let ret = this.buffer[this.pointer + 2] + (this.buffer[this.pointer + 1] << 8) + (this.buffer[this.pointer] << 16)
            this.pointer += 3
            return ret
        } else {
            let ret = this.buffer.readInt16BE(this.pointer)
            this.pointer += 2
            return ret
        }
    }

    public readIntLE(size: number): number {
        if(size == 4) {
            let ret = this.buffer.readInt32LE(this.pointer)
            this.pointer += 4
            return ret
        } else if(size == 3) {
            let ret = this.buffer[this.pointer] + (this.buffer[this.pointer + 1] << 8) + (this.buffer[this.pointer + 2] << 16)
            this.pointer += 3
            return ret
        } else {
            let ret = this.buffer.readInt16LE(this.pointer)
            this.pointer += 4
            return ret
        }
    }

    public readString(length: number | 'NUL'): string {
        if(length == 'NUL') {
            let tempBuffer: number[] = []

            while(this.buffer[this.pointer] != 0) {
                tempBuffer.push(this.readInt(1))
            }

            this.jump(1)

            return tempBuffer.reduce((pre,cur) => pre += String.fromCharCode(cur), '')
        } else {
            let tempBuffer = this.buffer.slice(this.pointer, this.pointer + length)

            this.pointer += length
            
            return tempBuffer.toString()
        }
    }

    public readLengthEncodedString(): string {
        let length = this.readUInt(1)
        let tempBuffer = this.buffer.slice(this.pointer, this.pointer + length)

        this.pointer += length
            
        return tempBuffer.toString()
    }

    public getBytes(): Buffer {
        return this.buffer
    }

    public getSize(): number {
        return this.buffer.byteLength
    }

    public writeString(value: string, terminated: boolean = false): void {
        if(terminated) {
            this.growIfNecessary(value.length + 1)

            this.buffer.write(value, this.pointer, value.length)
            this.pointer += value.length
            this.writeInt(0, 1)
        } else {
            this.growIfNecessary(value.length)

            this.buffer.write(value, this.pointer, value.length)
            this.pointer += value.length
        }
    }

    public writeLengthEncodedString(value: string) {
        this.writeUInt(0xFD, 1)
        this.writeUInt(value.length, 3)
        this.writeString(value)
    }
}