import {
    MigrationInterface,
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
import { TableIndexOptions } from 'typeorm/schema-builder/options/TableIndexOptions';
import { BaseTable } from './base.table';

export abstract class BaseMigration implements MigrationInterface {
    private queryRunner: QueryRunner = null;

    async create(tableName: string, callback: (table: BaseTable) => void): Promise<void> {
        const table = new BaseTable();
        callback(table);
        const newTable = new Table();
        newTable.name = tableName;
        newTable.columns = table.getNewColumns();
        await this.queryRunner.createTable(newTable);
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async update(tableName: string, callback: (table: BaseTable) => void): Promise<void> {
        const table = new BaseTable();
        callback(table);
        for (const column of table.columnToDeletes) {
            await this.queryRunner.dropColumn(tableName, column);
        }
        if (table.getNewColumns().length) {
            await this.queryRunner.addColumns(tableName, table.getNewColumns());
        }
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async drop(table: Table | string): Promise<void> {
        await this.queryRunner.dropTable(table);
    }

    async createForeignKeys(tableName: string, table: BaseTable): Promise<void> {
        for (const column of table.getForeignKeys()) {
            await this.queryRunner.createForeignKey(tableName, column);
        }
    }

    async createIndex(tableName: string, table: BaseTable): Promise<void> {
        for (const column of table.getIndexColumns()) {
            const index = new TableIndex({
                name: `${tableName}-${column.name}Index`,
                columnNames: [column.name]
            });
            await this.queryRunner.createIndex(tableName, index);
        }
    }

    abstract run(queryRunner: QueryRunner): Promise<void>;

    async rollback(queryRunner: QueryRunner): Promise<void> {
        console.log('No rollback');
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        this.queryRunner = queryRunner;
        await this.rollback(queryRunner);
    }

    async up(queryRunner: QueryRunner): Promise<void> {
        this.queryRunner = queryRunner;
        await this.run(queryRunner);
    }

    async dropIfExists(table: Table | string): Promise<void> {
        if (await this.queryRunner.hasTable(table)) {
            await this.queryRunner.dropTable(table);
        }
    }

    async hasTable(tableName: string): Promise<boolean> {
        return this.queryRunner.hasTable(tableName);
    }

    async hasColumn(tableName: string, columnName: string): Promise<boolean> {
        return this.queryRunner.hasColumn(tableName, columnName);
    }

    async rename(oldTableOrName: Table | string, newTableName: string): Promise<void> {
        await this.queryRunner.renameTable(oldTableOrName, newTableName);
    }

    async createUnique(table: Table | string, columnName: string, name?: string): Promise<void> {
        await this.queryRunner.createUniqueConstraint(
            table,
            new TableUnique({ name: name || `${table}-${columnName}Unique`, columnNames: [columnName] })
        );
    }

    async dropUnique(table: Table | string, uniqueOrName: TableUnique): Promise<void> {
        await this.queryRunner.dropUniqueConstraint(table, uniqueOrName);
    }

    async dropUniqueColumn(table: Table | string, columnName: string): Promise<void> {
        await this.queryRunner.dropUniqueConstraint(table, `${table}-${columnName}Unique`);
    }

    async renameColumn(table: Table | string, oldColumnName: string, newColumnName: string): Promise<void> {
        await this.queryRunner.renameColumn(table, oldColumnName, newColumnName);
    }

    async changeColumn(table: Table | string, oldColumn: TableColumn | string, newColumn: TableColumn): Promise<void> {
        await this.queryRunner.changeColumn(table, oldColumn, newColumn);
    }

    async dropColumn(table: Table | string, columnName: string): Promise<void> {
        await this.queryRunner.dropColumn(table, columnName);
    }

    async dropColumns(table: Table | string, columnNames: string[]): Promise<void> {
        await this.queryRunner.dropColumns(table, columnNames);
    }

    async dropIndex(table: Table | string, index: TableIndex | string): Promise<void> {
        await this.queryRunner.dropIndex(table, index);
    }

    async dropForeign(table: Table | string, foreignKeyOrName: TableForeignKey | string): Promise<void> {
        await this.queryRunner.dropForeignKey(table, foreignKeyOrName);
    }

    async query(query: string, parameters?: any[]): Promise<any> {
        return this.queryRunner.query(query, parameters);
    }

    async getTable(tableName: string): Promise<Table | undefined> {
        return this.queryRunner.getTable(tableName);
    }

    async clearTable(tableName: string): Promise<void> {
        await this.queryRunner.clearTable(tableName);
    }

    async changeTableComment(table: Table | string, comment?: string): Promise<void> {
        await this.queryRunner.changeTableComment(table, comment);
    }

    async addColumn(table: Table | string, column: TableColumn): Promise<void> {
        await this.queryRunner.addColumn(table, column);
    }

    async addColumns(table: Table | string, columns: TableColumn[]): Promise<void> {
        await this.queryRunner.addColumns(table, columns);
    }

    async changeColumns(
        table: Table | string,
        changedColumns: { oldColumn: TableColumn; newColumn: TableColumn }[]
    ): Promise<void> {
        await this.queryRunner.changeColumns(table, changedColumns);
    }

    async createPrimaryKey(table: Table | string, columnNames: string[], constraintName?: string): Promise<void> {
        await this.queryRunner.createPrimaryKey(table, columnNames, constraintName);
    }

    async updatePrimaryKeys(table: Table | string, columns: TableColumn[]): Promise<void> {
        await this.queryRunner.updatePrimaryKeys(table, columns);
    }

    async dropPrimaryKey(table: Table | string, constraintName?: string): Promise<void> {
        await this.queryRunner.dropPrimaryKey(table, constraintName);
    }

    async addIndex(tableName: string, columnNames: string[], options?: Partial<TableIndexOptions>): Promise<void> {
        const index = new TableIndex({
            name: `${tableName}-${columnNames.join('-')}Index`,
            columnNames,
            ...options
        });
        await this.queryRunner.createIndex(tableName, index);
    }

    async dropIndices(table: Table | string, indices: TableIndex[]): Promise<void> {
        await this.queryRunner.dropIndices(table, indices);
    }

    async addForeign(
        tableName: string,
        columnName: string,
        referencedTable: string,
        referencedColumn: string = 'id',
        onDelete = 'CASCADE',
        onUpdate = 'CASCADE'
    ): Promise<void> {
        await this.queryRunner.createForeignKey(
            tableName,
            new TableForeignKey({
                columnNames: [columnName],
                referencedTableName: referencedTable,
                referencedColumnNames: [referencedColumn],
                onDelete,
                onUpdate
            })
        );
    }

    async createCheck(table: Table | string, expression: string, name?: string): Promise<void> {
        await this.queryRunner.createCheckConstraint(table, new TableCheck({ name, expression }));
    }

    async dropCheck(table: Table | string, checkOrName: TableCheck | string): Promise<void> {
        await this.queryRunner.dropCheckConstraint(table, checkOrName);
    }

    async createExclusion(table: Table | string, expression: string, name?: string): Promise<void> {
        await this.queryRunner.createExclusionConstraint(table, new TableExclusion({ name, expression }));
    }

    async dropExclusion(table: Table | string, exclusionOrName: TableExclusion | string): Promise<void> {
        await this.queryRunner.dropExclusionConstraint(table, exclusionOrName);
    }

    async createView(name: string, expression: string, materialized = false): Promise<void> {
        await this.queryRunner.createView(new View({ name, expression, materialized }), false);
    }

    async dropView(view: View | string): Promise<void> {
        await this.queryRunner.dropView(view);
    }

    async createSchema(schemaPath: string, ifNotExist = true): Promise<void> {
        await this.queryRunner.createSchema(schemaPath, ifNotExist);
    }

    async dropSchema(schemaPath: string, ifExist = true, isCascade = false): Promise<void> {
        await this.queryRunner.dropSchema(schemaPath, ifExist, isCascade);
    }

    async hasSchema(schema: string): Promise<boolean> {
        return this.queryRunner.hasSchema(schema);
    }

    async createDatabase(database: string, ifNotExist = true): Promise<void> {
        await this.queryRunner.createDatabase(database, ifNotExist);
    }

    async dropDatabase(database: string, ifExist = true): Promise<void> {
        await this.queryRunner.dropDatabase(database, ifExist);
    }

    async hasDatabase(database: string): Promise<boolean> {
        return this.queryRunner.hasDatabase(database);
    }
}
