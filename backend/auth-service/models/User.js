const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const phoneRegex = /^\+[1-9]\d{1,14}$/;

const userSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minLength: 6,
            maxLength: 100,
        },

        role: {
            type: String,
            enum: ['provider', 'organization', 'admin'],
            default: 'provider'
        },

        organizationName: {
            type: String,
            required: function () {
                return this.role === "organization";
            },
        },

        address: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    const cleaned = v.replace(/[\s-]/g, '');
                    return phoneRegex.test(cleaned);
                },
                message: props => `${props.value}  is not a valid E.164 phone number! Example: +12025550143`
            }
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true
    }
);


userSchema.pre('save', async function () {

    if (!this.isModified("password")) return;

    try {
        this.password = await bcryptjs.hash(this.password, 10);
        return;
    } catch (error) {
        throw error;
    }

})


userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcryptjs.compare(password, this.password);
    } catch (error) {
        throw error;
    }
}

userSchema.methods.getAccessToken = function () {

    const user = { id: this._id, email: this.email, role: this.role };

    return jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    })
}

const User = mongoose.model('User', userSchema);

module.exports = User;