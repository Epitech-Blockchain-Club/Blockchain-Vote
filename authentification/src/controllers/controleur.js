const User = require('../models/User');
const transporter = require('../config/nodemailer');
const crypto = require('crypto');
const { text } = require('stream/consumers');
require('dotenv').config();

/*
Je suppose que le corp de http est sous cette forme
{
  "adminEmail": "admin@example.com",
  "adminPassword": "yourAdminPassword",
  "emails": [
    "user1@epitech.eu",
    "user2@epitech.eu",
    "user3@epitech.eu"
  ]
}
 */

const register = async(req, res) => {
    const {emails} = req.body;
    const admin_mail_env = process.env.ADMIN_EMAIL;
    const admin_pass_env = process.env.ADMIN_PASSWORD;
    const admin_mail_post = req.body.adminEmail;
    const admin_pass_post = req.body.adminPassword;

    //Seul l'admin peux ajouter des mails;
    if (admin_mail_post != admin_mail_env || admin_pass_env != admin_pass_post) {
        return res.status(403).json({msg: 'Acces Interdit'});
    }

    const addUsers = [];
    for (const email of emails) {
        if (!email.endsWith('@epitech.eu')) {
            return res.status(400).json({msg: email + ' is not valid'});
        };
    const pass = crypto.randomBytes(4).toString('hex'); //le mot de passe n'est pas unique
    try {
        const user = await User.create({email, password});
        await transporter.sendMail({
            to: email,
            subject: 'Inscription vote BDE 2025',
            text: 'Votre mot de passe est: ${password}'
        })
        addUsers.push(email);
    } catch (err) {
        return res.status(500).json({msg: 'Erreur lors de l\'enregistrement de ' + email, err});
    }
    }
    res.status(201).json({ message: 'Utilisateurs enregistrés.', users: addUsers});
}

module.exports = register;