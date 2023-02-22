"use strict";
export default function (sequelize, DataTypes) {
    const Analytic = sequelize.define(
        "Analytic",
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            shopId: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: "shops",
                    key: "id",
                },
                onDelete: "SET NULL",
            },
            upsaleId: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: "upsales",
                    key: "id",
                },
                onDelete: "SET NULL",
            },
            views: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            addToCarts: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            transactions: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            totalValue: {
                type: DataTypes.DOUBLE,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            timestamps: true,
            paranoid: false,
            tableName: "analytics",
            underscored: false,
            name: {
                singular: "analytic",
                plural: "analytics",
            },
        }
    );
    Analytic.associate = (models) => {
        Analytic.belongsTo(models.Shop, { foreignKey: "shopId" });
        Analytic.belongsTo(models.Upsale, { foreignKey: "upsaleId" });
    };
    return Analytic;
}
