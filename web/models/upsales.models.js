"use strict";
export default function (sequelize, DataTypes) {
    const Upsale = sequelize.define(
        "Upsale",
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            shopId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "shops",
                    key: "id",
                },
                onDelete: "cascade",
            },
            gId: {
                type: DataTypes.STRING,
            },
            selectedVariants: {
                type: DataTypes.ARRAY(DataTypes.TEXT),
                defaultValue: ["all"],
            },
            title: {
                type: DataTypes.STRING,
            },
            desc: {
                type: DataTypes.TEXT,
            },
            discount: {
                type: DataTypes.INTEGER,
            },
            targets: { type: DataTypes.JSON, allowNull: true },
            imageUrl: { type: DataTypes.STRING, allowNull: true },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            position: { type: DataTypes.INTEGER },
            priceRuleId: { type: DataTypes.STRING, allowNull: true },
            discountId: { type: DataTypes.STRING, allowNull: true },
            discountCode: { type: DataTypes.STRING, allowNull: true },
            customDiscountCode: { type: DataTypes.STRING, allowNull: true },
            settings: { type: DataTypes.JSON, allowNull: true },
            showReadMore: { type: DataTypes.BOOLEAN },
            isTrueUpsell: { type: DataTypes.BOOLEAN },
        },
        {
            timestamps: true,
            paranoid: true,
            tableName: "upsales",
            underscored: false,
            name: {
                singular: "upsale",
                plural: "upsales",
            },
        }
    );
    Upsale.associate = (models) => {
        Upsale.belongsTo(models.Shop, { foreignKey: "shopId" });
    };
    return Upsale;
}
