import mongoose from 'mongoose'

interface LogInput {
	date: Date;
	errorType: string;
	errorMessage: string;
}

interface LogDoc extends mongoose.Document {
	date: Date;
	errorType: string;
	errorMessage: string;
}

interface LogModel extends mongoose.Model<LogDoc> {
	build(errorInput: LogInput): Promise<void>
}

const logSchema = new mongoose.Schema(
  {
    date: {
      type: mongoose.Schema.Types.Date,
      required: true
    },
    errorType: {
      type: String,
      required: true
    },
    errorMessage: {
      type: String,
      required: true
    }
  }
)

logSchema.statics.build = async (errorInput: LogInput) : Promise<void> => {
	const log = new Log(errorInput)
	log.save()
}

const Log = mongoose.model<LogDoc, LogModel>('Log', logSchema)

export { Log }
