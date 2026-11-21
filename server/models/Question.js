import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required'],
      index: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [
        {
          id: {
            type: String,
            required: true,
          },
          text: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 2 && v.length <= 6;
        },
        message: 'A question must have between 2 and 6 options (standard is 4)',
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Correct answer identifier is required'],
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Marks must be at least 1'],
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ quizId: 1, order: 1 });

export default mongoose.model('Question', questionSchema);
