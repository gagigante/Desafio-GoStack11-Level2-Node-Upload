import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';

import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const csvFile = path.join(uploadConfig.directory, filename);

    const transactions: TransactionDTO[] = [];
    const transactionsCreated: Transaction[] = [];

    const stream = fs
      .createReadStream(csvFile)
      .pipe(csv({ columns: true, from_line: 1, trim: true }));

    stream.on('data', row => {
      transactions.push(row);
    });

    await new Promise(resolve => {
      stream.on('end', resolve);
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const transaction of transactions) {
      // eslint-disable-next-line no-await-in-loop
      const transactionAdd = await createTransactionService.execute(
        transaction,
      );

      transactionsCreated.push(transactionAdd);
    }

    return transactionsCreated;
  }
}

export default ImportTransactionsService;
