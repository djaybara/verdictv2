import { pgTable, uuid, text, timestamp, integer, varchar, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 140 }).notNull().unique(),
  category: varchar('category', { length: 32 }).notNull(),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
})

export const opinions = pgTable('opinions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').notNull(),
  side: varchar('side', { length: 10 }).notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
})

export const opinionReplies = pgTable('opinion_replies', {
  id: uuid('id').defaultRandom().primaryKey(),
  opinionId: uuid('opinion_id').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
})

export const votes = pgTable('votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').notNull(),
  userKey: varchar('user_key', { length: 64 }).notNull(),
  fingerprint: varchar('fingerprint', { length: 128 }),
  userId: varchar('user_id', { length: 128 }),
  side: varchar('side', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (t) => ({
  uq_user: uniqueIndex('uq_votes_q_user').on(t.questionId, t.userKey),
  uq_fp: uniqueIndex('uq_votes_q_fp').on(t.questionId, t.fingerprint),
  uq_clerk: uniqueIndex('uq_votes_q_clerk').on(t.questionId, t.userId),
}))

export const opinionUps = pgTable('opinion_ups', {
  id: uuid('id').defaultRandom().primaryKey(),
  opinionId: uuid('opinion_id').notNull(),
  userKey: varchar('user_key', { length: 64 }).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
}, (t) => ({
  uq: uniqueIndex('uq_opinion_ups').on(t.opinionId, t.userKey),
}))
