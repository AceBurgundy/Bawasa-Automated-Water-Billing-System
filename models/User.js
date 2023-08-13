const { validations } = require("../model_helpers.js")
const { db } = require("../sequelize_init")
const { DataTypes } = require('sequelize');

const User = db.define(
    "User",

    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        firstName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "First name is required"
                },
                notEmpty: {
                    msg: "First cannot be left blank"
                },
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        middleName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Middle name is required"
                },
                notEmpty: {
                    msg: "Middle name cannot be left blank"
                },
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        lastName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Last name is required"
                },
                notEmpty: {
                    msg: "Last name cannot be left blank"
                },
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        fullName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.firstName} ${this.middleName.charAt(0).toUpperCase()}. ${this.lastName}`;
            },
            set(value) {
                throw new Error("Do not try to set the `fullName` value!");
            }
        },
        
        extension: {
            type: DataTypes.STRING(10),
            validate: {
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        birthDate: {
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

        relationshipStatus: {
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

        profilePicture: {
            type: DataTypes.STRING(255),
            defaultValue: "user.webp"
        },

        nightMode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        accessKey: {
            type: DataTypes.STRING(64),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Access key is missing"
                }
            }
        }
    }
)

User.sync()
    .then(() => {
        console.log("User model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for User because of error:", error);
    })

module.exports = User
