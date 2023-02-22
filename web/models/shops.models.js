"use strict";
export default function (sequelize, DataTypes) {
    const Shop = sequelize.define(
        "Shop",
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            domain: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            accessToken: { type: DataTypes.STRING },
            settings: { type: DataTypes.JSON, allowNull: true },
            email: { type: DataTypes.STRING, allowNull: true },
            allProductsCollectionId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            customerEmail: { type: DataTypes.STRING, allowNull: true },
            shopName: { type: DataTypes.STRING, allowNull: true },
            owner: { type: DataTypes.STRING, allowNull: true },
            plan: { type: DataTypes.STRING, allowNull: true },
            city: { type: DataTypes.STRING, allowNull: true },
            countryName: { type: DataTypes.STRING, allowNull: true },
            currency: { type: DataTypes.STRING, allowNull: true },
            shopCreatedOn: { type: DataTypes.DATE, allowNull: true },
            shopUninstalledOn: { type: DataTypes.DATE, allowNull: true },
            state: { type: DataTypes.STRING, allowNull: true },
            isOnline: { type: DataTypes.BOOLEAN, allowNull: true },
            expires: { type: DataTypes.INTEGER, allowNull: true },
            scopes: { type: DataTypes.STRING, allowNull: true },
            onlineAccessInfo: { type: DataTypes.STRING, allowNull: true },
            moneyFormat: { type: DataTypes.STRING, allowNull: true },
            isSubscriptionActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            setupDismissed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isAppEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isAppVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            affiliate: { type: DataTypes.STRING, allowNull: true },
            passedXSales: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            timestamps: true,
            paranoid: true,
            tableName: "shops",
            underscored: false,
            name: {
                singular: "shop",
                plural: "shops",
            },
        }
    );
    Shop.associate = (models) => {
        Shop.hasMany(models.Upsale, { as: "upsales" });
    };
    return Shop;
}
