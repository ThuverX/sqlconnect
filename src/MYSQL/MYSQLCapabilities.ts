export enum CapabilityFlag {
    CLIENT_LONG_PASSWORD                  = 1,         //     Use the improved version of Old Password Authentication.
    CLIENT_FOUND_ROWS                     = 2,         //     Send found rows instead of affected rows in EOF_Packet.
    CLIENT_LONG_FLAG                      = 4,         //     Get all column flags.
    CLIENT_CONNECT_WITH_DB                = 8,         //     Database (schema) name can be specified on connect in Handshake Response Packet.
    CLIENT_NO_SCHEMA                      = 16,        //     Don't allow database.table.column.
    CLIENT_COMPRESS                       = 32,        //     Compression protocol supported.
    CLIENT_ODBC                           = 64,        //     Special handling of ODBC behavior.
    CLIENT_LOCAL_FILES                    = 128,       //     Can use LOAD DATA LOCAL.
    CLIENT_IGNORE_SPACE                   = 256,       //     Ignore spaces before '('.
    CLIENT_PROTOCOL_41                    = 512,       //     New 4.1 protocol.
    CLIENT_INTERACTIVE                    = 1024,      //     This is an interactive client.
    CLIENT_SSL                            = 2048,      //     Use SSL encryption for the session.
    CLIENT_IGNORE_SIGPIPE                 = 4096,      //     Client only flag.
    CLIENT_TRANSACTIONS                   = 8192,      //     Client knows about transactions.
    CLIENT_RESERVED                       = 16384,     //     DEPRECATED: Old flag for 4.1 protocol.
    CLIENT_SECURE_CONNECTION              = 32768,     //     DEPRECATED: Old flag for 4.1 authentication \ CLIENT_SECURE_CONNECTION.
}

export enum ExtendedCapabilityFlag {
    CLIENT_MULTI_STATEMENTS               = 1,//1 << 16,   //     Enable/disable multi-stmt support.
    CLIENT_MULTI_RESULTS                  = 2,//1 << 17,   //     Enable/disable multi-results.
    CLIENT_PS_MULTI_RESULTS               = 4,//1 << 18,   //     Multi-results and OUT parameters in PS-protocol.
    CLIENT_PLUGIN_AUTH                    = 8,//1 << 19,   //     Client supports plugin authentication.
    CLIENT_CONNECT_ATTRS                  = 16,//1 << 20,   //     Client supports connection attributes.
    CLIENT_PLUGIN_AUTH_LENENC_CLIENT_DATA = 32,//1 << 21,   //     Enable authentication response packet to be larger than 255 bytes.
    CLIENT_CAN_HANDLE_EXPIRED_PASSWORDS   = 64,//1 << 22,   //     Don't close the connection for a user account with expired password.
    CLIENT_SESSION_TRACK                  = 128,//1 << 23,   //     Capable of handling server state change information.
    CLIENT_DEPRECATE_EOF                  = 256//1 << 24,   //     Client no longer needs EOF_Packet and will use OK_Packet instead.
}
