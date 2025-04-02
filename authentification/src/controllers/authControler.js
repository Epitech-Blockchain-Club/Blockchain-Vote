const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* I am supposing that req.body look like
    {
        "email": "test@epitech.eu",
        "password": "testpassword"
    }
*/
exports.login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur inexistant' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }
        const my_token = jwt.sign({userId: user.id}, process.env.SECRET, {expiresIn: '48h'});
        return res.status(200).json({ msg: 'Connecté avec succès!', my_token});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error'});
    }
};
