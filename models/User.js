const { validations } = require("../model_helpers")
const { db } = require("../sequelize_init")
const { DataTypes } = require('sequelize')

const User = db.define(
    "User",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: "Email is required"
                },
                isEmail: {
                    msg: "Invalid email format"
                },
                notEmpty: {
                    msg: "Email cannot be left blank"
                }
            }
        },

        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Password is required"
                },
                notEmpty: {
                    msg: "Password cannot be left blank"
                }
            }
        },

        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "First name is required"
                },
                notEmpty: {
                    msg: "First cannot be left blank"
                },
                isAlpha: {
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        middle_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Middle name is required"
                },
                notEmpty: {
                    msg: "Middle name cannot be left blank"
                },
                isAlpha: {
                    msg: "Must not contain a number or a symbol or blank"
                }
            }
        },

        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last name is required"
                },
                notEmpty: {
                    msg: "Last name cannot be left blank"
                },
                isAlpha: {
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        extension: {
            type: DataTypes.STRING(10),
            validate: {
                isAlpha: {
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        relationship_status: {
            type: DataTypes.STRING(35),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Relationship status is required"
                },
                notEmpty: {
                    msg: "Relationship status cannot be left blank"
                },
                isIn: {
                    args: validations.relationshipOptions,
                    msg: "Invalid relationship status"
                }
            }
        },

        birthdate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Birthdate cannot be left blank"
                },
                isDate: {
                    msg: "Only date input is allowed"
                }
            }
        },
 
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Age cannot be left blank"
                },
                isNumeric: {
                    msg: "Age must be a number"
                }
            }
        },

        profile_picture: {
            type: DataTypes.STRING(255),
            defaultValue: "user.webp"
        },

        night_mode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        user_type: {
            type: DataTypes.STRING(25),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "User type is required"
                },
                notEmpty: {
                    msg: "User type cannot be left blank"
                },
                isIn: {
                    args: validations.userOptions,
                    msg: "Invalid user type"
                }
            }
        }
    }
)

User.sync()

module.exports = User
