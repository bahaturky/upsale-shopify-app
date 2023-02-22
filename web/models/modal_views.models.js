"use strict";
export default function (sequelize, DataTypes) {
    const ModalView = sequelize.define(
        "ModalView",
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
            views: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            timestamps: true,
            paranoid: false,
            tableName: "modal_views",
            underscored: false,
            name: {
                singular: "modal_view",
                plural: "modal_views",
            },
        }
    );
    ModalView.associate = (models) => {
        ModalView.belongsTo(models.Shop, { foreignKey: "shopId" });
    };
    return ModalView;
}
