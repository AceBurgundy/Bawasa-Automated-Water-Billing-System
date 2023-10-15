const { RELATIONSHIP_OPTIONS } = require("../source/utilities/constants")
const { DB } = require("../source/utilities/sequelize")
const { DATA_TYPES } = require('sequelize');

const USER_ADDRESS = require("./UserAddress");

const USER = DB.define(
    "User",
    {
        id: {
            type: DATA_TYPES.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        firstName: {
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.VIRTUAL,
            get() {
                return `${this.firstName} ${this.middleName.charAt(0).toUpperCase()}. ${this.lastName}`;
            },
            set(value) {
                throw new Error("Do not try to set the `fullName` value!");
            }
        },
        
        extension: {
            type: DATA_TYPES.STRING(10),
            validate: {
                is: {
                    args: /^[A-Za-z\s]+$/,
                    msg: "Must not contain a number or a symbol"
                }
            }
        },

        birthDate: {
            type: DATA_TYPES.DATEONLY,
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
            type: DATA_TYPES.INTEGER,
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
            type: DATA_TYPES.STRING(35),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Relationship status is required"
                },
                notEmpty: {
                    msg: "Relationship status cannot be left blank"
                },
                isIn: {
                    args: RELATIONSHIP_OPTIONS,
                    msg: "Invalid relationship status"
                }
            }
        },
        
        email: {
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(255),
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
            type: DATA_TYPES.STRING(255),
            defaultValue: ""
        },

        nightMode: {
            type: DATA_TYPES.BOOLEAN,
            defaultValue: false
        },

        accessKey: {
            type: DATA_TYPES.STRING(64),
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Access key is missing"
                }
            }
        }
    }
)

USER.hasOne(USER_ADDRESS, { 
    foreignKey: "mainAddressId", 
    as: "mainAddress"
})

USER.hasOne(USER_ADDRESS, { 
    foreignKey: "presentAddressId", 
    as: "presentAddress"
})

USER_ADDRESS.belongsTo(USER, {
	foreignKey: "mainAddressId",
	as: "mainAddress",
})

USER_ADDRESS.belongsTo(USER, {
	foreignKey: "presentAddressId",
	as: "presentAddress",
})

USER.sync()
    .then(() => {
        console.log("User model successfully created or synchronized");
    })
    .catch((error) => {
        console.error("\n\nError creating/synchronizing table for User because of error:", error);
    })

module.exports = USER
