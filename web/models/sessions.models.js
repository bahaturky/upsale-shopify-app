"use strict";
export default function (sequelize, DataTypes) {
    const Session = sequelize.define(
        "Session",
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            accessToken: { type: DataTypes.STRING },
            shop: { type: DataTypes.STRING },
            state: { type: DataTypes.STRING },
            isOnline: { type: DataTypes.BOOLEAN },
            scope: { type: DataTypes.STRING },
            expires: { type: DataTypes.INTEGER },
        },
        {
            timestamps: false,
            paranoid: true,
            tableName: "sessions",
            underscored: false,
        }
    );

    return Session;
}
