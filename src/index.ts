import { MYSQLConnection } from './MYSQL/MYSQLConnection'

async function main() {
    let db = await new MYSQLConnection({
        hostname: 'localhost',
        user: 'root',
        database: 'test',
        password: ''
    }).connect()

    // let result = await db
    //     .insertInto('company')
    //     .data([
    //         { COMPANY_ID: 20, COMPANY_NAME: 'Company 1', COMPANY_CITY: 'TestCity' },
    //         { COMPANY_ID: 21, COMPANY_NAME: 'Company 2', COMPANY_CITY: 'TestCity' },
    //         { COMPANY_ID: 22, COMPANY_NAME: 'Company 3', COMPANY_CITY: 'TestCity' },
    //     ])
    //     .done()

    // let statement = await db
    //     .select('*')
    //     .from('company')
    //     .where('COMPANY_ID', '?')
    //     .prepare()

    // console.log(await statement.perform(19))
    // console.log(await statement.perform(15))
    // console.log(await statement.perform(16))

    await db.use('promos-pa')

    console.log(await db
        .select('*')
        .from('promos')
        .where('promogever','Paulliev')
        .limit(1)
        .get())

    db.disconnect()
}

main()