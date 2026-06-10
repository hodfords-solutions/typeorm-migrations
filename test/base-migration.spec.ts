import { BaseMigration, BaseTable } from '@hodfords/typeorm-migrations';
import {
    QueryRunner,
    Table,
    TableCheck,
    TableColumn,
    TableExclusion,
    TableForeignKey,
    TableIndex,
    TableUnique,
    View
} from 'typeorm';

class TestMigration extends BaseMigration {
    async run(): Promise<void> {}
}

const createMockQueryRunner = (): jest.Mocked<QueryRunner> => {
    return {
        query: jest.fn(),
        createTable: jest.fn(),
        dropTable: jest.fn(),
        renameTable: jest.fn(),
        hasTable: jest.fn(),
        hasColumn: jest.fn(),
        getTable: jest.fn(),
        clearTable: jest.fn(),
        changeTableComment: jest.fn(),
        addColumn: jest.fn(),
        addColumns: jest.fn(),
        renameColumn: jest.fn(),
        changeColumn: jest.fn(),
        changeColumns: jest.fn(),
        dropColumn: jest.fn(),
        dropColumns: jest.fn(),
        createPrimaryKey: jest.fn(),
        updatePrimaryKeys: jest.fn(),
        dropPrimaryKey: jest.fn(),
        createUniqueConstraint: jest.fn(),
        dropUniqueConstraint: jest.fn(),
        createCheckConstraint: jest.fn(),
        dropCheckConstraint: jest.fn(),
        createExclusionConstraint: jest.fn(),
        dropExclusionConstraint: jest.fn(),
        createForeignKey: jest.fn(),
        dropForeignKey: jest.fn(),
        createIndex: jest.fn(),
        dropIndex: jest.fn(),
        dropIndices: jest.fn(),
        createView: jest.fn(),
        dropView: jest.fn(),
        createSchema: jest.fn(),
        dropSchema: jest.fn(),
        hasSchema: jest.fn(),
        createDatabase: jest.fn(),
        dropDatabase: jest.fn(),
        hasDatabase: jest.fn()
    } as unknown as jest.Mocked<QueryRunner>;
};

describe('BaseMigration', () => {
    let migration: TestMigration;
    let queryRunner: jest.Mocked<QueryRunner>;

    beforeEach(async () => {
        migration = new TestMigration();
        queryRunner = createMockQueryRunner();
        await migration.up(queryRunner);
    });

    describe('create()', () => {
        it('creates the table with the defined columns', async () => {
            await migration.create('User', (table: BaseTable) => {
                table.primaryUuid('id');
                table.string('email');
            });
            expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
            const createdTable = queryRunner.createTable.mock.calls[0][0] as Table;
            expect(createdTable.name).toEqual('User');
            expect(createdTable.columns.map((column) => column.name)).toEqual(['id', 'email']);
        });

        it('creates indexes for columns marked with index()', async () => {
            await migration.create('User', (table: BaseTable) => {
                table.string('email').index();
            });
            expect(queryRunner.createIndex).toHaveBeenCalledTimes(1);
            const [tableName, index] = queryRunner.createIndex.mock.calls[0] as [string, TableIndex];
            expect(tableName).toEqual('User');
            expect(index.name).toEqual('User-emailIndex');
            expect(index.columnNames).toEqual(['email']);
        });

        it('creates foreign keys for columns marked with foreign()', async () => {
            await migration.create('Post', (table: BaseTable) => {
                table.uuid('userId').foreign('User');
            });
            expect(queryRunner.createForeignKey).toHaveBeenCalledTimes(1);
            const [tableName, foreignKey] = queryRunner.createForeignKey.mock.calls[0] as [string, TableForeignKey];
            expect(tableName).toEqual('Post');
            expect(foreignKey.referencedTableName).toEqual('User');
        });
    });

    describe('update()', () => {
        it('adds new columns to the table', async () => {
            await migration.update('User', (table: BaseTable) => {
                table.string('phone').nullable();
            });
            expect(queryRunner.addColumns).toHaveBeenCalledTimes(1);
            const [tableName, columns] = queryRunner.addColumns.mock.calls[0] as [string, TableColumn[]];
            expect(tableName).toEqual('User');
            expect(columns.map((column) => column.name)).toEqual(['phone']);
        });

        it('drops columns registered with dropColumn()', async () => {
            await migration.update('User', (table: BaseTable) => {
                table.dropColumn('legacy');
            });
            expect(queryRunner.dropColumn).toHaveBeenCalledWith('User', 'legacy');
            expect(queryRunner.addColumns).not.toHaveBeenCalled();
        });

        it('creates indexes for existing columns via addIndexAlreadyColumn()', async () => {
            await migration.update('User', (table: BaseTable) => {
                table.addIndexAlreadyColumn('email');
            });
            expect(queryRunner.createIndex).toHaveBeenCalledTimes(1);
            const index = queryRunner.createIndex.mock.calls[0][1] as TableIndex;
            expect(index.name).toEqual('User-emailIndex');
        });
    });

    describe('up() and down()', () => {
        it('up() delegates to run()', async () => {
            const runSpy = jest.spyOn(migration, 'run');
            await migration.up(queryRunner);
            expect(runSpy).toHaveBeenCalledWith(queryRunner);
        });

        it('down() delegates to rollback()', async () => {
            const rollbackSpy = jest.spyOn(migration, 'rollback');
            await migration.down(queryRunner);
            expect(rollbackSpy).toHaveBeenCalledWith(queryRunner);
        });
    });

    describe('table operations', () => {
        it('drop() drops the table', async () => {
            await migration.drop('User');
            expect(queryRunner.dropTable).toHaveBeenCalledWith('User');
        });

        it('dropIfExists() drops the table when it exists', async () => {
            queryRunner.hasTable.mockResolvedValue(true);
            await migration.dropIfExists('User');
            expect(queryRunner.dropTable).toHaveBeenCalledWith('User');
        });

        it('dropIfExists() does nothing when the table does not exist', async () => {
            queryRunner.hasTable.mockResolvedValue(false);
            await migration.dropIfExists('User');
            expect(queryRunner.dropTable).not.toHaveBeenCalled();
        });

        it('rename() renames the table', async () => {
            await migration.rename('User', 'Account');
            expect(queryRunner.renameTable).toHaveBeenCalledWith('User', 'Account');
        });

        it('hasTable() delegates to the query runner', async () => {
            queryRunner.hasTable.mockResolvedValue(true);
            await expect(migration.hasTable('User')).resolves.toEqual(true);
        });

        it('getTable() delegates to the query runner', async () => {
            const table = new Table({ name: 'User' });
            queryRunner.getTable.mockResolvedValue(table);
            await expect(migration.getTable('User')).resolves.toBe(table);
        });

        it('clearTable() truncates the table', async () => {
            await migration.clearTable('User');
            expect(queryRunner.clearTable).toHaveBeenCalledWith('User');
        });

        it('changeTableComment() updates the table comment', async () => {
            await migration.changeTableComment('User', 'user accounts');
            expect(queryRunner.changeTableComment).toHaveBeenCalledWith('User', 'user accounts');
        });
    });

    describe('column operations', () => {
        it('hasColumn() delegates to the query runner', async () => {
            queryRunner.hasColumn.mockResolvedValue(true);
            await expect(migration.hasColumn('User', 'email')).resolves.toEqual(true);
        });

        it('addColumn() adds a single column', async () => {
            const column = new TableColumn({ name: 'phone', type: 'character varying' });
            await migration.addColumn('User', column);
            expect(queryRunner.addColumn).toHaveBeenCalledWith('User', column);
        });

        it('addColumns() adds multiple columns', async () => {
            const columns = [new TableColumn({ name: 'phone', type: 'character varying' })];
            await migration.addColumns('User', columns);
            expect(queryRunner.addColumns).toHaveBeenCalledWith('User', columns);
        });

        it('renameColumn() renames a column', async () => {
            await migration.renameColumn('User', 'email', 'emailAddress');
            expect(queryRunner.renameColumn).toHaveBeenCalledWith('User', 'email', 'emailAddress');
        });

        it('changeColumn() changes a column', async () => {
            const newColumn = new TableColumn({ name: 'email', type: 'text' });
            await migration.changeColumn('User', 'email', newColumn);
            expect(queryRunner.changeColumn).toHaveBeenCalledWith('User', 'email', newColumn);
        });

        it('changeColumns() changes multiple columns', async () => {
            const change = {
                oldColumn: new TableColumn({ name: 'email', type: 'character varying' }),
                newColumn: new TableColumn({ name: 'email', type: 'text' })
            };
            await migration.changeColumns('User', [change]);
            expect(queryRunner.changeColumns).toHaveBeenCalledWith('User', [change]);
        });

        it('dropColumn() drops a column', async () => {
            await migration.dropColumn('User', 'legacy');
            expect(queryRunner.dropColumn).toHaveBeenCalledWith('User', 'legacy');
        });

        it('dropColumns() drops multiple columns', async () => {
            await migration.dropColumns('User', ['legacy', 'unused']);
            expect(queryRunner.dropColumns).toHaveBeenCalledWith('User', ['legacy', 'unused']);
        });
    });

    describe('primary key operations', () => {
        it('createPrimaryKey() creates a primary key', async () => {
            await migration.createPrimaryKey('User', ['id'], 'PK_user');
            expect(queryRunner.createPrimaryKey).toHaveBeenCalledWith('User', ['id'], 'PK_user');
        });

        it('updatePrimaryKeys() updates the primary keys', async () => {
            const columns = [new TableColumn({ name: 'id', type: 'uuid' })];
            await migration.updatePrimaryKeys('User', columns);
            expect(queryRunner.updatePrimaryKeys).toHaveBeenCalledWith('User', columns);
        });

        it('dropPrimaryKey() drops the primary key', async () => {
            await migration.dropPrimaryKey('User');
            expect(queryRunner.dropPrimaryKey).toHaveBeenCalledWith('User', undefined);
        });
    });

    describe('unique constraint operations', () => {
        it('createUnique() creates a unique constraint with a generated name', async () => {
            await migration.createUnique('User', 'email');
            expect(queryRunner.createUniqueConstraint).toHaveBeenCalledTimes(1);
            const [tableName, unique] = queryRunner.createUniqueConstraint.mock.calls[0] as [string, TableUnique];
            expect(tableName).toEqual('User');
            expect(unique.name).toEqual('User-emailUnique');
            expect(unique.columnNames).toEqual(['email']);
        });

        it('createUnique() accepts a custom constraint name', async () => {
            await migration.createUnique('User', 'email', 'UQ_user_email');
            const unique = queryRunner.createUniqueConstraint.mock.calls[0][1] as TableUnique;
            expect(unique.name).toEqual('UQ_user_email');
        });

        it('dropUnique() drops a unique constraint', async () => {
            const unique = new TableUnique({ name: 'UQ_user_email', columnNames: ['email'] });
            await migration.dropUnique('User', unique);
            expect(queryRunner.dropUniqueConstraint).toHaveBeenCalledWith('User', unique);
        });

        it('dropUniqueColumn() drops a unique constraint by generated name', async () => {
            await migration.dropUniqueColumn('User', 'email');
            expect(queryRunner.dropUniqueConstraint).toHaveBeenCalledWith('User', 'User-emailUnique');
        });
    });

    describe('check and exclusion constraint operations', () => {
        it('createCheck() creates a check constraint', async () => {
            await migration.createCheck('User', '"age" > 0', 'CHK_age');
            expect(queryRunner.createCheckConstraint).toHaveBeenCalledTimes(1);
            const [tableName, check] = queryRunner.createCheckConstraint.mock.calls[0] as [string, TableCheck];
            expect(tableName).toEqual('User');
            expect(check.name).toEqual('CHK_age');
            expect(check.expression).toEqual('"age" > 0');
        });

        it('dropCheck() drops a check constraint', async () => {
            await migration.dropCheck('User', 'CHK_age');
            expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith('User', 'CHK_age');
        });

        it('createExclusion() creates an exclusion constraint', async () => {
            await migration.createExclusion('Booking', 'USING gist ("room" WITH =, "during" WITH &&)');
            expect(queryRunner.createExclusionConstraint).toHaveBeenCalledTimes(1);
            const exclusion = queryRunner.createExclusionConstraint.mock.calls[0][1] as TableExclusion;
            expect(exclusion.expression).toEqual('USING gist ("room" WITH =, "during" WITH &&)');
        });

        it('dropExclusion() drops an exclusion constraint', async () => {
            await migration.dropExclusion('Booking', 'XCL_booking');
            expect(queryRunner.dropExclusionConstraint).toHaveBeenCalledWith('Booking', 'XCL_booking');
        });
    });

    describe('index operations', () => {
        it('addIndex() creates an index with a generated name', async () => {
            await migration.addIndex('User', ['email', 'status']);
            expect(queryRunner.createIndex).toHaveBeenCalledTimes(1);
            const [tableName, index] = queryRunner.createIndex.mock.calls[0] as [string, TableIndex];
            expect(tableName).toEqual('User');
            expect(index.name).toEqual('User-email-statusIndex');
            expect(index.columnNames).toEqual(['email', 'status']);
        });

        it('addIndex() accepts index options', async () => {
            await migration.addIndex('User', ['email'], { isUnique: true, name: 'IDX_custom' });
            const index = queryRunner.createIndex.mock.calls[0][1] as TableIndex;
            expect(index.name).toEqual('IDX_custom');
            expect(index.isUnique).toEqual(true);
        });

        it('dropIndex() drops an index', async () => {
            await migration.dropIndex('User', 'User-emailIndex');
            expect(queryRunner.dropIndex).toHaveBeenCalledWith('User', 'User-emailIndex');
        });

        it('dropIndices() drops multiple indices', async () => {
            const indices = [new TableIndex({ name: 'IDX_email', columnNames: ['email'] })];
            await migration.dropIndices('User', indices);
            expect(queryRunner.dropIndices).toHaveBeenCalledWith('User', indices);
        });
    });

    describe('foreign key operations', () => {
        it('addForeign() creates a foreign key with defaults', async () => {
            await migration.addForeign('Post', 'userId', 'User');
            expect(queryRunner.createForeignKey).toHaveBeenCalledTimes(1);
            const [tableName, foreignKey] = queryRunner.createForeignKey.mock.calls[0] as [string, TableForeignKey];
            expect(tableName).toEqual('Post');
            expect(foreignKey.columnNames).toEqual(['userId']);
            expect(foreignKey.referencedTableName).toEqual('User');
            expect(foreignKey.referencedColumnNames).toEqual(['id']);
            expect(foreignKey.onDelete).toEqual('CASCADE');
        });

        it('dropForeign() drops a foreign key', async () => {
            await migration.dropForeign('Post', 'FK_post_user');
            expect(queryRunner.dropForeignKey).toHaveBeenCalledWith('Post', 'FK_post_user');
        });
    });

    describe('view operations', () => {
        it('createView() creates a view', async () => {
            await migration.createView('active_users', 'SELECT * FROM "User" WHERE "deletedAt" IS NULL');
            expect(queryRunner.createView).toHaveBeenCalledTimes(1);
            const view = queryRunner.createView.mock.calls[0][0] as View;
            expect(view.name).toEqual('active_users');
            expect(view.expression).toEqual('SELECT * FROM "User" WHERE "deletedAt" IS NULL');
            expect(view.materialized).toEqual(false);
        });

        it('createView() supports materialized views', async () => {
            await migration.createView('user_stats', 'SELECT count(*) FROM "User"', true);
            const view = queryRunner.createView.mock.calls[0][0] as View;
            expect(view.materialized).toEqual(true);
        });

        it('dropView() drops a view', async () => {
            await migration.dropView('active_users');
            expect(queryRunner.dropView).toHaveBeenCalledWith('active_users');
        });
    });

    describe('schema and database operations', () => {
        it('createSchema() creates a schema', async () => {
            await migration.createSchema('reporting');
            expect(queryRunner.createSchema).toHaveBeenCalledWith('reporting', true);
        });

        it('dropSchema() drops a schema', async () => {
            await migration.dropSchema('reporting', true, true);
            expect(queryRunner.dropSchema).toHaveBeenCalledWith('reporting', true, true);
        });

        it('hasSchema() delegates to the query runner', async () => {
            queryRunner.hasSchema.mockResolvedValue(true);
            await expect(migration.hasSchema('reporting')).resolves.toEqual(true);
        });

        it('createDatabase() creates a database', async () => {
            await migration.createDatabase('analytics');
            expect(queryRunner.createDatabase).toHaveBeenCalledWith('analytics', true);
        });

        it('dropDatabase() drops a database', async () => {
            await migration.dropDatabase('analytics');
            expect(queryRunner.dropDatabase).toHaveBeenCalledWith('analytics', true);
        });

        it('hasDatabase() delegates to the query runner', async () => {
            queryRunner.hasDatabase.mockResolvedValue(false);
            await expect(migration.hasDatabase('analytics')).resolves.toEqual(false);
        });
    });

    describe('query()', () => {
        it('executes a raw query with parameters', async () => {
            queryRunner.query.mockResolvedValue([{ count: 1 }]);
            const result = await migration.query('SELECT count(*) FROM "User" WHERE "role" = $1', [1]);
            expect(queryRunner.query).toHaveBeenCalledWith('SELECT count(*) FROM "User" WHERE "role" = $1', [1]);
            expect(result).toEqual([{ count: 1 }]);
        });
    });
});
