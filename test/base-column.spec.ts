import { BaseColumn } from '@hodfords/typeorm-migrations';
import { TableColumn, TableForeignKey } from 'typeorm';

describe('BaseColumn', () => {
    let column: BaseColumn;

    beforeEach(() => {
        column = new BaseColumn(new TableColumn({ name: 'testColumn', type: 'character varying' }));
    });

    it('length() sets the column length', () => {
        column.length(100);
        expect(column.tableColumn.length).toEqual(100);
    });

    it('nullable() marks the column as nullable', () => {
        column.nullable();
        expect(column.tableColumn.isNullable).toEqual(true);
    });

    it('notNullable() marks the column as not nullable', () => {
        column.nullable().notNullable();
        expect(column.tableColumn.isNullable).toEqual(false);
    });

    it('unique() marks the column as unique', () => {
        column.unique();
        expect(column.tableColumn.isUnique).toEqual(true);
    });

    it('index() flags the column for index creation', () => {
        column.index();
        expect(column.isIndex).toEqual(true);
    });

    it('default() sets the default value', () => {
        column.default("'en'");
        expect(column.tableColumn.default).toEqual("'en'");
    });

    it('primary() marks the column as primary', () => {
        column.primary();
        expect(column.tableColumn.isPrimary).toEqual(true);
    });

    it('primary() accepts a constraint name', () => {
        column.primary('PK_custom');
        expect(column.tableColumn.primaryKeyConstraintName).toEqual('PK_custom');
    });

    it('array() marks the column as an array', () => {
        column.array();
        expect(column.tableColumn.isArray).toEqual(true);
    });

    it('autoIncrement() enables increment generation', () => {
        column.autoIncrement();
        expect(column.tableColumn.isGenerated).toEqual(true);
        expect(column.tableColumn.generationStrategy).toEqual('increment');
    });

    it('generated() defaults to increment strategy', () => {
        column.generated();
        expect(column.tableColumn.isGenerated).toEqual(true);
        expect(column.tableColumn.generationStrategy).toEqual('increment');
    });

    it('generated() accepts an uuid strategy', () => {
        column.generated('uuid');
        expect(column.tableColumn.generationStrategy).toEqual('uuid');
    });

    it('generatedIdentity() configures an identity column', () => {
        column.generatedIdentity('ALWAYS');
        expect(column.tableColumn.isGenerated).toEqual(true);
        expect(column.tableColumn.generationStrategy).toEqual('identity');
        expect(column.tableColumn.generatedIdentity).toEqual('ALWAYS');
    });

    it('asExpression() configures a generated column expression', () => {
        column.asExpression('"firstName" || \' \' || "lastName"');
        expect(column.tableColumn.asExpression).toEqual('"firstName" || \' \' || "lastName"');
        expect(column.tableColumn.generatedType).toEqual('STORED');
    });

    it('precision() sets precision and optionally scale', () => {
        column.precision(12, 4);
        expect(column.tableColumn.precision).toEqual(12);
        expect(column.tableColumn.scale).toEqual(4);
    });

    it('scale() sets the scale', () => {
        column.scale(6);
        expect(column.tableColumn.scale).toEqual(6);
    });

    it('charset() sets the charset', () => {
        column.charset('utf8mb4');
        expect(column.tableColumn.charset).toEqual('utf8mb4');
    });

    it('collation() sets the collation', () => {
        column.collation('en_US.utf8');
        expect(column.tableColumn.collation).toEqual('en_US.utf8');
    });

    it('enum() sets enum values and name', () => {
        column.enum(['active', 'inactive'], 'status_enum');
        expect(column.tableColumn.enum).toEqual(['active', 'inactive']);
        expect(column.tableColumn.enumName).toEqual('status_enum');
    });

    it('spatial() sets the spatial feature type and srid', () => {
        column.spatial('Point', 4326);
        expect(column.tableColumn.spatialFeatureType).toEqual('Point');
        expect(column.tableColumn.srid).toEqual(4326);
    });

    it('width() sets the display width', () => {
        column.width(4);
        expect(column.tableColumn.width).toEqual(4);
    });

    it('unsigned() sets the unsigned attribute', () => {
        column.unsigned();
        expect(column.tableColumn.unsigned).toEqual(true);
    });

    it('zerofill() sets the zerofill attribute', () => {
        column.zerofill();
        expect(column.tableColumn.zerofill).toEqual(true);
    });

    it('onUpdate() sets the ON UPDATE trigger', () => {
        column.onUpdate('CURRENT_TIMESTAMP');
        expect(column.tableColumn.onUpdate).toEqual('CURRENT_TIMESTAMP');
    });

    it('useCurrent() defaults the column to now()', () => {
        column.useCurrent();
        expect(column.tableColumn.default).toEqual('now()');
    });

    it('comment() sets the column comment', () => {
        column.comment('the user email');
        expect(column.tableColumn.comment).toEqual('the user email');
    });

    it('methods are chainable', () => {
        const result = column.nullable().unique().index().default(null).comment('chained');
        expect(result).toBe(column);
    });

    describe('foreign()', () => {
        it('registers a foreign key with defaults', () => {
            column.foreign('User');
            expect(column.foreignKeys).toHaveLength(1);
            const foreignKey = column.foreignKeys[0] as TableForeignKey;
            expect(foreignKey.columnNames).toEqual(['testColumn']);
            expect(foreignKey.referencedTableName).toEqual('User');
            expect(foreignKey.referencedColumnNames).toEqual(['id']);
            expect(foreignKey.onDelete).toEqual('CASCADE');
            expect(foreignKey.onUpdate).toEqual('CASCADE');
        });

        it('accepts custom column, actions and constraint name', () => {
            column.foreign('User', 'uuid', 'SET NULL', 'NO ACTION', 'FK_custom');
            const foreignKey = column.foreignKeys[0] as TableForeignKey;
            expect(foreignKey.referencedColumnNames).toEqual(['uuid']);
            expect(foreignKey.onDelete).toEqual('SET NULL');
            expect(foreignKey.onUpdate).toEqual('NO ACTION');
            expect(foreignKey.name).toEqual('FK_custom');
        });
    });
});
