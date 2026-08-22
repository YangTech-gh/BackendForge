import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/backend_forge');

export interface LineItem {
  accountId: string;
  debit: number;
  credit: number;
}

export async function postJournalEntry(
  tenantId: string,
  description: string,
  items: LineItem[],
  reference?: string
): Promise<string> {
  const totalDebit = items.reduce((s, i) => s + i.debit, 0);
  const totalCredit = items.reduce((s, i) => s + i.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Debits (${totalDebit}) must equal credits (${totalCredit})`);
  }

  return await sql.begin(async (tx) => {
    const [entry] = await tx`
      INSERT INTO journal_entries (tenant_id, description, reference)
      VALUES (${tenantId}, ${description}, ${reference || null})
      RETURNING id
    `;
    for (const item of items) {
      await tx`
        INSERT INTO line_items (journal_entry_id, account_id, debit, credit)
        VALUES (${entry.id}, ${item.accountId}, ${item.debit}, ${item.credit})
      `;
      const col = item.debit > 0 ? 'debit' : 'credit';
      await tx`UPDATE accounts SET balance = balance ${item.debit > 0 ? sql`+ ${item.debit}` : sql`- ${item.credit}`} WHERE id = ${item.accountId}`;
    }
    return entry.id;
  });
}
