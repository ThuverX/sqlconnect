export enum FieldType {
    MYSQL_TYPE_DECIMAL = 0x00,
    MYSQL_TYPE_TINY = 0x01,
    MYSQL_TYPE_SHORT = 0x02,
    MYSQL_TYPE_LONG = 0x03,
    MYSQL_TYPE_FLOAT = 0x04,
    MYSQL_TYPE_DOUBLE = 0x05,
    MYSQL_TYPE_NULL = 0x06,
    MYSQL_TYPE_TIMESTAMP = 0x07,
    MYSQL_TYPE_LONGLONG = 0x08,
    MYSQL_TYPE_INT24 = 0x09,
    MYSQL_TYPE_DATE = 0x0a,
    MYSQL_TYPE_TIME = 0x0b,
    MYSQL_TYPE_DATETIME = 0x0c,
    MYSQL_TYPE_YEAR = 0x0d,
    MYSQL_TYPE_VARCHAR = 0x0f,
    MYSQL_TYPE_BIT = 0x10,
    MYSQL_TYPE_NEWDECIMAL = 0xf6,
    MYSQL_TYPE_ENUM = 0xf7,
    MYSQL_TYPE_SET = 0xf8,
    MYSQL_TYPE_TINY_BLOB = 0xf9,
    MYSQL_TYPE_MEDIUM_BLOB = 0xfa,
    MYSQL_TYPE_LONG_BLOB = 0xfb,
    MYSQL_TYPE_BLOB = 0xfc,
    MYSQL_TYPE_VAR_STRING = 0xfd,
    MYSQL_TYPE_STRING = 0xfe,
    MYSQL_TYPE_GEOMETRY = 0xff,
}

export const NULL = Symbol('MYSQL_NULL')

export function ConvertFieldWithType(type: FieldType, value: string): string | number | bigint | Buffer | boolean | typeof NULL | Date {
    switch (type) {
        case FieldType.MYSQL_TYPE_DECIMAL:
        case FieldType.MYSQL_TYPE_TINY:
        case FieldType.MYSQL_TYPE_SHORT:
        case FieldType.MYSQL_TYPE_LONG:
        case FieldType.MYSQL_TYPE_FLOAT:
        case FieldType.MYSQL_TYPE_DOUBLE:
        case FieldType.MYSQL_TYPE_INT24:
        case FieldType.MYSQL_TYPE_NEWDECIMAL:
            return Number(value)

        case FieldType.MYSQL_TYPE_LONGLONG:
            return BigInt(value)
                    
        case FieldType.MYSQL_TYPE_NULL:
            return NULL

        case FieldType.MYSQL_TYPE_TINY_BLOB:
        case FieldType.MYSQL_TYPE_MEDIUM_BLOB:
        case FieldType.MYSQL_TYPE_LONG_BLOB:
        case FieldType.MYSQL_TYPE_BLOB:
            return Buffer.from(value)

        case FieldType.MYSQL_TYPE_BIT:
            return value == '1'

        case FieldType.MYSQL_TYPE_VARCHAR:
        case FieldType.MYSQL_TYPE_VAR_STRING:
        case FieldType.MYSQL_TYPE_STRING:
            return String(value)

        case FieldType.MYSQL_TYPE_TIMESTAMP:
        case FieldType.MYSQL_TYPE_DATE:
        case FieldType.MYSQL_TYPE_TIME:
        case FieldType.MYSQL_TYPE_DATETIME:
            return new Date(value)

        default:
            throw 'invalid type: ' + type + ` (${FieldType[type]}) using value: ` + value
    }
}