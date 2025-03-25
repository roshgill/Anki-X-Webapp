'use server';

import { neon } from '@neondatabase/serverless';

export async function connectNeonDatabase() {
  const sql = neon(`${process.env.DATABASE_URL}`);
  await sql(`INSERT INTO comments (post_id, user_id, comment_text, created_at)
    VALUES (2, 3, 'This is another sample comment.', NOW())`);
}

export async function getFlashcardsCount() {
    try {
      const sql = neon(`${process.env.DATABASE_URL}`);
      const result = await sql`
        SELECT counter FROM flashcardscreated LIMIT 1
      `;
      return result[0].counter;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }
  
  export async function getAndIncrementCardsCount(cardsCreated: number) {
    try {
      const sql = neon(`${process.env.DATABASE_URL}`);
      
      // Get current counter value
      const result = await sql`
        SELECT counter FROM flashcardscreated LIMIT 1
      `;
      
      const currentCount = result[0].counter;
      const newCount = currentCount + cardsCreated;
      
      // Increment counter in database
      await sql`
        UPDATE flashcardscreated 
        SET counter = ${newCount}
      `;
  
      return currentCount;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }