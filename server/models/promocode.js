const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true }, // Промокод: 'XXXX-XXXX-XXXX-XXXX'
  reward: { type: Number, required: true },              // Сколько денег даёт
  expiresAt: { type: Date },                             // Срок действия (опционально)
  maxActivations: { type: Number, default: 1 },          // Сколько раз можно использовать (0 = бесконечно)
  activatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Кто уже использовал
  createdAt: { type: Date, default: Date.now }
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;