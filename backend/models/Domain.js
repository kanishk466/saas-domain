const mongoose = require('mongoose');
const domainSchema = new mongoose.Schema({
  domainName:{
    type: String,
    required: true,
    unique: true
  },
    userId:{    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    }
}, { timestamps: true });

module.exports = mongoose.model('Domain', domainSchema);

module.exports = mongoose.model('Domain', domainSchema);