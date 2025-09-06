/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  date: { input: any; output: any };
  jsonb: { input: any; output: any };
  numeric: { input: any; output: any };
  timestamptz: { input: any; output: any };
  uuid: { input: any; output: any };
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export type CreateDeviceRequestInput = {
  extensionId: Scalars['String']['input'];
};

export type CreateDeviceRequestOutput = {
  __typename?: 'CreateDeviceRequestOutput';
  deviceCode: Scalars['String']['output'];
  expiresIn: Scalars['Int']['output'];
  interval: Scalars['Int']['output'];
  userCode: Scalars['String']['output'];
  verificationUri: Scalars['String']['output'];
  verificationUriComplete: Scalars['String']['output'];
};

export type CreateDeviceRequestResponse = {
  __typename?: 'CreateDeviceRequestResponse';
  data?: Maybe<CreateDeviceRequestOutput>;
  error?: Maybe<DeviceRequestError>;
  success: Scalars['Boolean']['output'];
};

export type DeviceRequestError = {
  __typename?: 'DeviceRequestError';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** Junction table between audios and tags, many to many relationship */
export type Audio_Tags = {
  __typename?: 'audio_tags';
  /** An object relationship */
  audio: Audios;
  audio_id: Scalars['uuid']['output'];
  /** An object relationship */
  tag: Tags;
  tag_id: Scalars['uuid']['output'];
};

/** order by aggregate values of table "audio_tags" */
export type Audio_Tags_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Audio_Tags_Max_Order_By>;
  min?: InputMaybe<Audio_Tags_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "audio_tags". All fields are combined with a logical 'AND'. */
export type Audio_Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Audio_Tags_Bool_Exp>>;
  _not?: InputMaybe<Audio_Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Audio_Tags_Bool_Exp>>;
  audio?: InputMaybe<Audios_Bool_Exp>;
  audio_id?: InputMaybe<Uuid_Comparison_Exp>;
  tag?: InputMaybe<Tags_Bool_Exp>;
  tag_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** order by max() on columns of table "audio_tags" */
export type Audio_Tags_Max_Order_By = {
  audio_id?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "audio_tags" */
export type Audio_Tags_Min_Order_By = {
  audio_id?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "audio_tags". */
export type Audio_Tags_Order_By = {
  audio?: InputMaybe<Audios_Order_By>;
  audio_id?: InputMaybe<Order_By>;
  tag?: InputMaybe<Tags_Order_By>;
  tag_id?: InputMaybe<Order_By>;
};

/** select columns of table "audio_tags" */
export enum Audio_Tags_Select_Column {
  /** column name */
  AudioId = 'audio_id',
  /** column name */
  TagId = 'tag_id',
}

/** Streaming cursor of the table "audio_tags" */
export type Audio_Tags_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Audio_Tags_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Audio_Tags_Stream_Cursor_Value_Input = {
  audio_id?: InputMaybe<Scalars['uuid']['input']>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Audios for listen site */
export type Audios = {
  __typename?: 'audios';
  artistName: Scalars['String']['output'];
  /** An array relationship */
  audio_tags: Array<Audio_Tags>;
  createdAt: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  public: Scalars['Boolean']['output'];
  source: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
};

/** Audios for listen site */
export type AudiosAudio_TagsArgs = {
  distinct_on?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audio_Tags_Order_By>>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};

/** order by aggregate values of table "audios" */
export type Audios_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Audios_Max_Order_By>;
  min?: InputMaybe<Audios_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "audios". All fields are combined with a logical 'AND'. */
export type Audios_Bool_Exp = {
  _and?: InputMaybe<Array<Audios_Bool_Exp>>;
  _not?: InputMaybe<Audios_Bool_Exp>;
  _or?: InputMaybe<Array<Audios_Bool_Exp>>;
  artistName?: InputMaybe<String_Comparison_Exp>;
  audio_tags?: InputMaybe<Audio_Tags_Bool_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  public?: InputMaybe<Boolean_Comparison_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  thumbnailUrl?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "audios" */
export enum Audios_Constraint {
  /** unique or primary key constraint on columns "id" */
  AudiosPkey = 'audios_pkey',
}

/** input type for inserting data into table "audios" */
export type Audios_Insert_Input = {
  artistName?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** order by max() on columns of table "audios" */
export type Audios_Max_Order_By = {
  artistName?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "audios" */
export type Audios_Min_Order_By = {
  artistName?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "audios" */
export type Audios_Mutation_Response = {
  __typename?: 'audios_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Audios>;
};

/** on_conflict condition type for table "audios" */
export type Audios_On_Conflict = {
  constraint: Audios_Constraint;
  update_columns?: Array<Audios_Update_Column>;
  where?: InputMaybe<Audios_Bool_Exp>;
};

/** Ordering options when selecting data from "audios". */
export type Audios_Order_By = {
  artistName?: InputMaybe<Order_By>;
  audio_tags_aggregate?: InputMaybe<Audio_Tags_Aggregate_Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  public?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: audios */
export type Audios_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "audios" */
export enum Audios_Select_Column {
  /** column name */
  ArtistName = 'artistName',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Public = 'public',
  /** column name */
  Source = 'source',
  /** column name */
  ThumbnailUrl = 'thumbnailUrl',
  /** column name */
  UpdatedAt = 'updatedAt',
}

/** input type for updating data in table "audios" */
export type Audios_Set_Input = {
  artistName?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "audios" */
export type Audios_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Audios_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Audios_Stream_Cursor_Value_Input = {
  artistName?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "audios" */
export enum Audios_Update_Column {
  /** column name */
  ArtistName = 'artistName',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Name = 'name',
  /** column name */
  Public = 'public',
  /** column name */
  Source = 'source',
  /** column name */
  ThumbnailUrl = 'thumbnailUrl',
  /** column name */
  UpdatedAt = 'updatedAt',
}

export type Audios_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Audios_Set_Input>;
  /** filter the rows which have to be updated */
  where: Audios_Bool_Exp;
};

/** columns and relationships of "book_comments" */
export type Book_Comments = {
  __typename?: 'book_comments';
  bookId: Scalars['uuid']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  /** An object relationship */
  user: Users;
};

/** order by aggregate values of table "book_comments" */
export type Book_Comments_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Book_Comments_Max_Order_By>;
  min?: InputMaybe<Book_Comments_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "book_comments". All fields are combined with a logical 'AND'. */
export type Book_Comments_Bool_Exp = {
  _and?: InputMaybe<Array<Book_Comments_Bool_Exp>>;
  _not?: InputMaybe<Book_Comments_Bool_Exp>;
  _or?: InputMaybe<Array<Book_Comments_Bool_Exp>>;
  bookId?: InputMaybe<Uuid_Comparison_Exp>;
  content?: InputMaybe<String_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "book_comments" */
export enum Book_Comments_Constraint {
  /** unique or primary key constraint on columns "id" */
  BookCommentsPkey = 'book_comments_pkey',
}

/** input type for inserting data into table "book_comments" */
export type Book_Comments_Insert_Input = {
  bookId?: InputMaybe<Scalars['uuid']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
};

/** order by max() on columns of table "book_comments" */
export type Book_Comments_Max_Order_By = {
  bookId?: InputMaybe<Order_By>;
  content?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "book_comments" */
export type Book_Comments_Min_Order_By = {
  bookId?: InputMaybe<Order_By>;
  content?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "book_comments" */
export type Book_Comments_Mutation_Response = {
  __typename?: 'book_comments_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Book_Comments>;
};

/** on_conflict condition type for table "book_comments" */
export type Book_Comments_On_Conflict = {
  constraint: Book_Comments_Constraint;
  update_columns?: Array<Book_Comments_Update_Column>;
  where?: InputMaybe<Book_Comments_Bool_Exp>;
};

/** Ordering options when selecting data from "book_comments". */
export type Book_Comments_Order_By = {
  bookId?: InputMaybe<Order_By>;
  content?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
};

/** select columns of table "book_comments" */
export enum Book_Comments_Select_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
}

/** placeholder for update columns of table "book_comments" (current role has no relevant permissions) */
export enum Book_Comments_Update_Column {
  /** placeholder (do not use) */
  Placeholder = '_PLACEHOLDER',
}

/** columns and relationships of "books" */
export type Books = {
  __typename?: 'books';
  author: Scalars['String']['output'];
  createdAt: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  /** An array relationship */
  reading_progresses: Array<Reading_Progresses>;
  /** An aggregate relationship */
  reading_progresses_aggregate: Reading_Progresses_Aggregate;
  /** Final URL for the book, validated, end user can not update this field. This can be null for offline books */
  source?: Maybe<Scalars['String']['output']>;
  /** Could be either "ready" or "processing" */
  status: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  totalPages: Scalars['Int']['output'];
  /** An object relationship */
  user: Users;
};

/** columns and relationships of "books" */
export type BooksReading_ProgressesArgs = {
  distinct_on?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reading_Progresses_Order_By>>;
  where?: InputMaybe<Reading_Progresses_Bool_Exp>;
};

/** columns and relationships of "books" */
export type BooksReading_Progresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reading_Progresses_Order_By>>;
  where?: InputMaybe<Reading_Progresses_Bool_Exp>;
};

/** aggregated selection of "books" */
export type Books_Aggregate = {
  __typename?: 'books_aggregate';
  aggregate?: Maybe<Books_Aggregate_Fields>;
  nodes: Array<Books>;
};

export type Books_Aggregate_Bool_Exp = {
  count?: InputMaybe<Books_Aggregate_Bool_Exp_Count>;
};

export type Books_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Books_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Books_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "books" */
export type Books_Aggregate_Fields = {
  __typename?: 'books_aggregate_fields';
  avg?: Maybe<Books_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Books_Max_Fields>;
  min?: Maybe<Books_Min_Fields>;
  stddev?: Maybe<Books_Stddev_Fields>;
  stddev_pop?: Maybe<Books_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Books_Stddev_Samp_Fields>;
  sum?: Maybe<Books_Sum_Fields>;
  var_pop?: Maybe<Books_Var_Pop_Fields>;
  var_samp?: Maybe<Books_Var_Samp_Fields>;
  variance?: Maybe<Books_Variance_Fields>;
};

/** aggregate fields of "books" */
export type Books_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Books_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "books" */
export type Books_Aggregate_Order_By = {
  avg?: InputMaybe<Books_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Books_Max_Order_By>;
  min?: InputMaybe<Books_Min_Order_By>;
  stddev?: InputMaybe<Books_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Books_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Books_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Books_Sum_Order_By>;
  var_pop?: InputMaybe<Books_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Books_Var_Samp_Order_By>;
  variance?: InputMaybe<Books_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Books_Avg_Fields = {
  __typename?: 'books_avg_fields';
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "books" */
export type Books_Avg_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "books". All fields are combined with a logical 'AND'. */
export type Books_Bool_Exp = {
  _and?: InputMaybe<Array<Books_Bool_Exp>>;
  _not?: InputMaybe<Books_Bool_Exp>;
  _or?: InputMaybe<Array<Books_Bool_Exp>>;
  author?: InputMaybe<String_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  reading_progresses?: InputMaybe<Reading_Progresses_Bool_Exp>;
  reading_progresses_aggregate?: InputMaybe<Reading_Progresses_Aggregate_Bool_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  thumbnailUrl?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  totalPages?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
};

/** aggregate max on columns */
export type Books_Max_Fields = {
  __typename?: 'books_max_fields';
  author?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Final URL for the book, validated, end user can not update this field. This can be null for offline books */
  source?: Maybe<Scalars['String']['output']>;
  /** Could be either "ready" or "processing" */
  status?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  totalPages?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "books" */
export type Books_Max_Order_By = {
  author?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Final URL for the book, validated, end user can not update this field. This can be null for offline books */
  source?: InputMaybe<Order_By>;
  /** Could be either "ready" or "processing" */
  status?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Books_Min_Fields = {
  __typename?: 'books_min_fields';
  author?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Final URL for the book, validated, end user can not update this field. This can be null for offline books */
  source?: Maybe<Scalars['String']['output']>;
  /** Could be either "ready" or "processing" */
  status?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  totalPages?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "books" */
export type Books_Min_Order_By = {
  author?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Final URL for the book, validated, end user can not update this field. This can be null for offline books */
  source?: InputMaybe<Order_By>;
  /** Could be either "ready" or "processing" */
  status?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "books". */
export type Books_Order_By = {
  author?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  reading_progresses_aggregate?: InputMaybe<Reading_Progresses_Aggregate_Order_By>;
  source?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
};

/** select columns of table "books" */
export enum Books_Select_Column {
  /** column name */
  Author = 'author',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Source = 'source',
  /** column name */
  Status = 'status',
  /** column name */
  ThumbnailUrl = 'thumbnailUrl',
  /** column name */
  Title = 'title',
  /** column name */
  TotalPages = 'totalPages',
}

/** aggregate stddev on columns */
export type Books_Stddev_Fields = {
  __typename?: 'books_stddev_fields';
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "books" */
export type Books_Stddev_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Books_Stddev_Pop_Fields = {
  __typename?: 'books_stddev_pop_fields';
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "books" */
export type Books_Stddev_Pop_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Books_Stddev_Samp_Fields = {
  __typename?: 'books_stddev_samp_fields';
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "books" */
export type Books_Stddev_Samp_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Books_Sum_Fields = {
  __typename?: 'books_sum_fields';
  totalPages?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "books" */
export type Books_Sum_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Books_Var_Pop_Fields = {
  __typename?: 'books_var_pop_fields';
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "books" */
export type Books_Var_Pop_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Books_Var_Samp_Fields = {
  __typename?: 'books_var_samp_fields';
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "books" */
export type Books_Var_Samp_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Books_Variance_Fields = {
  __typename?: 'books_variance_fields';
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "books" */
export type Books_Variance_Order_By = {
  totalPages?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "crawl_requests". All fields are combined with a logical 'AND'. */
export type Crawl_Requests_Bool_Exp = {
  _and?: InputMaybe<Array<Crawl_Requests_Bool_Exp>>;
  _not?: InputMaybe<Crawl_Requests_Bool_Exp>;
  _or?: InputMaybe<Array<Crawl_Requests_Bool_Exp>>;
};

/** unique or primary key constraints on table "crawl_requests" */
export enum Crawl_Requests_Constraint {
  /** unique or primary key constraint on columns "id" */
  CrawlRequestsPkey = 'crawl_requests_pkey',
}

/** input type for inserting data into table "crawl_requests" */
export type Crawl_Requests_Insert_Input = {
  get_single_video?: InputMaybe<Scalars['Boolean']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug_prefix?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

/** response of any mutation on the table "crawl_requests" */
export type Crawl_Requests_Mutation_Response = {
  __typename?: 'crawl_requests_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
};

/** on_conflict condition type for table "crawl_requests" */
export type Crawl_Requests_On_Conflict = {
  constraint: Crawl_Requests_Constraint;
  update_columns?: Array<Crawl_Requests_Update_Column>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};

/** placeholder for update columns of table "crawl_requests" (current role has no relevant permissions) */
export enum Crawl_Requests_Update_Column {
  /** placeholder (do not use) */
  Placeholder = '_PLACEHOLDER',
}

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC',
}

/** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
export type Date_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['date']['input']>;
  _gt?: InputMaybe<Scalars['date']['input']>;
  _gte?: InputMaybe<Scalars['date']['input']>;
  _in?: InputMaybe<Array<Scalars['date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['date']['input']>;
  _lte?: InputMaybe<Scalars['date']['input']>;
  _neq?: InputMaybe<Scalars['date']['input']>;
  _nin?: InputMaybe<Array<Scalars['date']['input']>>;
};

/** Feature flag system and we must leverage Hasura subscription to watch this */
export type Feature_Flag = {
  __typename?: 'feature_flag';
  conditions?: Maybe<Scalars['jsonb']['output']>;
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  site: Scalars['String']['output'];
};

/** Feature flag system and we must leverage Hasura subscription to watch this */
export type Feature_FlagConditionsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to filter rows from the table "feature_flag". All fields are combined with a logical 'AND'. */
export type Feature_Flag_Bool_Exp = {
  _and?: InputMaybe<Array<Feature_Flag_Bool_Exp>>;
  _not?: InputMaybe<Feature_Flag_Bool_Exp>;
  _or?: InputMaybe<Array<Feature_Flag_Bool_Exp>>;
  conditions?: InputMaybe<Jsonb_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  site?: InputMaybe<String_Comparison_Exp>;
};

/** Ordering options when selecting data from "feature_flag". */
export type Feature_Flag_Order_By = {
  conditions?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  site?: InputMaybe<Order_By>;
};

/** select columns of table "feature_flag" */
export enum Feature_Flag_Select_Column {
  /** column name */
  Conditions = 'conditions',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Site = 'site',
}

/** Streaming cursor of the table "feature_flag" */
export type Feature_Flag_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Feature_Flag_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Feature_Flag_Stream_Cursor_Value_Input = {
  conditions?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
};

/** Transactions for personal finance management */
export type Finance_Transactions = {
  __typename?: 'finance_transactions';
  amount: Scalars['numeric']['output'];
  /** Should be either must, nice or waste */
  category: Scalars['String']['output'];
  createdAt: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  month: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
  year: Scalars['Int']['output'];
};

/** aggregated selection of "finance_transactions" */
export type Finance_Transactions_Aggregate = {
  __typename?: 'finance_transactions_aggregate';
  aggregate?: Maybe<Finance_Transactions_Aggregate_Fields>;
  nodes: Array<Finance_Transactions>;
};

export type Finance_Transactions_Aggregate_Bool_Exp = {
  count?: InputMaybe<Finance_Transactions_Aggregate_Bool_Exp_Count>;
};

export type Finance_Transactions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Finance_Transactions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "finance_transactions" */
export type Finance_Transactions_Aggregate_Fields = {
  __typename?: 'finance_transactions_aggregate_fields';
  avg?: Maybe<Finance_Transactions_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Finance_Transactions_Max_Fields>;
  min?: Maybe<Finance_Transactions_Min_Fields>;
  stddev?: Maybe<Finance_Transactions_Stddev_Fields>;
  stddev_pop?: Maybe<Finance_Transactions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Finance_Transactions_Stddev_Samp_Fields>;
  sum?: Maybe<Finance_Transactions_Sum_Fields>;
  var_pop?: Maybe<Finance_Transactions_Var_Pop_Fields>;
  var_samp?: Maybe<Finance_Transactions_Var_Samp_Fields>;
  variance?: Maybe<Finance_Transactions_Variance_Fields>;
};

/** aggregate fields of "finance_transactions" */
export type Finance_Transactions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "finance_transactions" */
export type Finance_Transactions_Aggregate_Order_By = {
  avg?: InputMaybe<Finance_Transactions_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Finance_Transactions_Max_Order_By>;
  min?: InputMaybe<Finance_Transactions_Min_Order_By>;
  stddev?: InputMaybe<Finance_Transactions_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Finance_Transactions_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Finance_Transactions_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Finance_Transactions_Sum_Order_By>;
  var_pop?: InputMaybe<Finance_Transactions_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Finance_Transactions_Var_Samp_Order_By>;
  variance?: InputMaybe<Finance_Transactions_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Finance_Transactions_Avg_Fields = {
  __typename?: 'finance_transactions_avg_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "finance_transactions" */
export type Finance_Transactions_Avg_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "finance_transactions". All fields are combined with a logical 'AND'. */
export type Finance_Transactions_Bool_Exp = {
  _and?: InputMaybe<Array<Finance_Transactions_Bool_Exp>>;
  _not?: InputMaybe<Finance_Transactions_Bool_Exp>;
  _or?: InputMaybe<Array<Finance_Transactions_Bool_Exp>>;
  amount?: InputMaybe<Numeric_Comparison_Exp>;
  category?: InputMaybe<String_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  month?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  note?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  year?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "finance_transactions" */
export enum Finance_Transactions_Constraint {
  /** unique or primary key constraint on columns "id" */
  FinanceTransactionsPkey = 'finance_transactions_pkey',
}

/** input type for incrementing numeric columns in table "finance_transactions" */
export type Finance_Transactions_Inc_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "finance_transactions" */
export type Finance_Transactions_Insert_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  /** Should be either must, nice or waste */
  category?: InputMaybe<Scalars['String']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Finance_Transactions_Max_Fields = {
  __typename?: 'finance_transactions_max_fields';
  amount?: Maybe<Scalars['numeric']['output']>;
  /** Should be either must, nice or waste */
  category?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  month?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "finance_transactions" */
export type Finance_Transactions_Max_Order_By = {
  amount?: InputMaybe<Order_By>;
  /** Should be either must, nice or waste */
  category?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  note?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Finance_Transactions_Min_Fields = {
  __typename?: 'finance_transactions_min_fields';
  amount?: Maybe<Scalars['numeric']['output']>;
  /** Should be either must, nice or waste */
  category?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  month?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "finance_transactions" */
export type Finance_Transactions_Min_Order_By = {
  amount?: InputMaybe<Order_By>;
  /** Should be either must, nice or waste */
  category?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  note?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "finance_transactions" */
export type Finance_Transactions_Mutation_Response = {
  __typename?: 'finance_transactions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Finance_Transactions>;
};

/** on_conflict condition type for table "finance_transactions" */
export type Finance_Transactions_On_Conflict = {
  constraint: Finance_Transactions_Constraint;
  update_columns?: Array<Finance_Transactions_Update_Column>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};

/** Ordering options when selecting data from "finance_transactions". */
export type Finance_Transactions_Order_By = {
  amount?: InputMaybe<Order_By>;
  category?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  note?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** primary key columns input for table: finance_transactions */
export type Finance_Transactions_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "finance_transactions" */
export enum Finance_Transactions_Select_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  Category = 'category',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Month = 'month',
  /** column name */
  Name = 'name',
  /** column name */
  Note = 'note',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id',
  /** column name */
  Year = 'year',
}

/** input type for updating data in table "finance_transactions" */
export type Finance_Transactions_Set_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  /** Should be either must, nice or waste */
  category?: InputMaybe<Scalars['String']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Finance_Transactions_Stddev_Fields = {
  __typename?: 'finance_transactions_stddev_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "finance_transactions" */
export type Finance_Transactions_Stddev_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Finance_Transactions_Stddev_Pop_Fields = {
  __typename?: 'finance_transactions_stddev_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "finance_transactions" */
export type Finance_Transactions_Stddev_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Finance_Transactions_Stddev_Samp_Fields = {
  __typename?: 'finance_transactions_stddev_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "finance_transactions" */
export type Finance_Transactions_Stddev_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Finance_Transactions_Sum_Fields = {
  __typename?: 'finance_transactions_sum_fields';
  amount?: Maybe<Scalars['numeric']['output']>;
  month?: Maybe<Scalars['Int']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "finance_transactions" */
export type Finance_Transactions_Sum_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** update columns of table "finance_transactions" */
export enum Finance_Transactions_Update_Column {
  /** column name */
  Amount = 'amount',
  /** column name */
  Category = 'category',
  /** column name */
  Month = 'month',
  /** column name */
  Name = 'name',
  /** column name */
  Note = 'note',
  /** column name */
  Year = 'year',
}

export type Finance_Transactions_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Finance_Transactions_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Finance_Transactions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Finance_Transactions_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Finance_Transactions_Var_Pop_Fields = {
  __typename?: 'finance_transactions_var_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "finance_transactions" */
export type Finance_Transactions_Var_Pop_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Finance_Transactions_Var_Samp_Fields = {
  __typename?: 'finance_transactions_var_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "finance_transactions" */
export type Finance_Transactions_Var_Samp_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Finance_Transactions_Variance_Fields = {
  __typename?: 'finance_transactions_variance_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "finance_transactions" */
export type Finance_Transactions_Variance_Order_By = {
  amount?: InputMaybe<Order_By>;
  month?: InputMaybe<Order_By>;
  year?: InputMaybe<Order_By>;
};

/** Daily journal */
export type Journals = {
  __typename?: 'journals';
  content: Scalars['String']['output'];
  createdAt: Scalars['timestamptz']['output'];
  date: Scalars['date']['output'];
  id: Scalars['uuid']['output'];
  mood: Scalars['String']['output'];
  tags: Scalars['jsonb']['output'];
  updatedAt: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
};

/** Daily journal */
export type JournalsTagsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "journals" */
export type Journals_Aggregate = {
  __typename?: 'journals_aggregate';
  aggregate?: Maybe<Journals_Aggregate_Fields>;
  nodes: Array<Journals>;
};

export type Journals_Aggregate_Bool_Exp = {
  count?: InputMaybe<Journals_Aggregate_Bool_Exp_Count>;
};

export type Journals_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Journals_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Journals_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "journals" */
export type Journals_Aggregate_Fields = {
  __typename?: 'journals_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Journals_Max_Fields>;
  min?: Maybe<Journals_Min_Fields>;
};

/** aggregate fields of "journals" */
export type Journals_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Journals_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "journals" */
export type Journals_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Journals_Max_Order_By>;
  min?: InputMaybe<Journals_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Journals_Append_Input = {
  tags?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "journals". All fields are combined with a logical 'AND'. */
export type Journals_Bool_Exp = {
  _and?: InputMaybe<Array<Journals_Bool_Exp>>;
  _not?: InputMaybe<Journals_Bool_Exp>;
  _or?: InputMaybe<Array<Journals_Bool_Exp>>;
  content?: InputMaybe<String_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  date?: InputMaybe<Date_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  mood?: InputMaybe<String_Comparison_Exp>;
  tags?: InputMaybe<Jsonb_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "journals" */
export enum Journals_Constraint {
  /** unique or primary key constraint on columns "id" */
  JournalsPkey = 'journals_pkey',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Journals_Delete_At_Path_Input = {
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Journals_Delete_Elem_Input = {
  tags?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Journals_Delete_Key_Input = {
  tags?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "journals" */
export type Journals_Insert_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  mood?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['jsonb']['input']>;
};

/** aggregate max on columns */
export type Journals_Max_Fields = {
  __typename?: 'journals_max_fields';
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  date?: Maybe<Scalars['date']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mood?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "journals" */
export type Journals_Max_Order_By = {
  content?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  mood?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Journals_Min_Fields = {
  __typename?: 'journals_min_fields';
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  date?: Maybe<Scalars['date']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  mood?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "journals" */
export type Journals_Min_Order_By = {
  content?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  mood?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "journals" */
export type Journals_Mutation_Response = {
  __typename?: 'journals_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Journals>;
};

/** on_conflict condition type for table "journals" */
export type Journals_On_Conflict = {
  constraint: Journals_Constraint;
  update_columns?: Array<Journals_Update_Column>;
  where?: InputMaybe<Journals_Bool_Exp>;
};

/** Ordering options when selecting data from "journals". */
export type Journals_Order_By = {
  content?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  date?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  mood?: InputMaybe<Order_By>;
  tags?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: journals */
export type Journals_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Journals_Prepend_Input = {
  tags?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "journals" */
export enum Journals_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Date = 'date',
  /** column name */
  Id = 'id',
  /** column name */
  Mood = 'mood',
  /** column name */
  Tags = 'tags',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "journals" */
export type Journals_Set_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  mood?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['jsonb']['input']>;
};

/** update columns of table "journals" */
export enum Journals_Update_Column {
  /** column name */
  Content = 'content',
  /** column name */
  Date = 'date',
  /** column name */
  Mood = 'mood',
  /** column name */
  Tags = 'tags',
}

export type Journals_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Journals_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Journals_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Journals_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Journals_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Journals_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Journals_Set_Input>;
  /** filter the rows which have to be updated */
  where: Journals_Bool_Exp;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** Request to generate code for next step authentication, called from other sources like smart tivi apps, extensions, etc. */
  createDeviceRequest: CreateDeviceRequestResponse;
  /** delete data from the table: "audios" */
  delete_audios?: Maybe<Audios_Mutation_Response>;
  /** delete single row from the table: "audios" */
  delete_audios_by_pk?: Maybe<Audios>;
  /** delete data from the table: "finance_transactions" */
  delete_finance_transactions?: Maybe<Finance_Transactions_Mutation_Response>;
  /** delete single row from the table: "finance_transactions" */
  delete_finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** delete data from the table: "journals" */
  delete_journals?: Maybe<Journals_Mutation_Response>;
  /** delete single row from the table: "journals" */
  delete_journals_by_pk?: Maybe<Journals>;
  /** delete data from the table: "videos" */
  delete_videos?: Maybe<Videos_Mutation_Response>;
  /** delete single row from the table: "videos" */
  delete_videos_by_pk?: Maybe<Videos>;
  /** insert data into the table: "audios" */
  insert_audios?: Maybe<Audios_Mutation_Response>;
  /** insert a single row into the table: "audios" */
  insert_audios_one?: Maybe<Audios>;
  /** insert data into the table: "book_comments" */
  insert_book_comments?: Maybe<Book_Comments_Mutation_Response>;
  /** insert a single row into the table: "book_comments" */
  insert_book_comments_one?: Maybe<Book_Comments>;
  /** insert data into the table: "crawl_requests" */
  insert_crawl_requests?: Maybe<Crawl_Requests_Mutation_Response>;
  /** insert data into the table: "finance_transactions" */
  insert_finance_transactions?: Maybe<Finance_Transactions_Mutation_Response>;
  /** insert a single row into the table: "finance_transactions" */
  insert_finance_transactions_one?: Maybe<Finance_Transactions>;
  /** insert data into the table: "journals" */
  insert_journals?: Maybe<Journals_Mutation_Response>;
  /** insert a single row into the table: "journals" */
  insert_journals_one?: Maybe<Journals>;
  /** insert data into the table: "playlist" */
  insert_playlist?: Maybe<Playlist_Mutation_Response>;
  /** insert a single row into the table: "playlist" */
  insert_playlist_one?: Maybe<Playlist>;
  /** insert data into the table: "playlist_videos" */
  insert_playlist_videos?: Maybe<Playlist_Videos_Mutation_Response>;
  /** insert a single row into the table: "playlist_videos" */
  insert_playlist_videos_one?: Maybe<Playlist_Videos>;
  /** insert data into the table: "reading_progresses" */
  insert_reading_progresses?: Maybe<Reading_Progresses_Mutation_Response>;
  /** insert a single row into the table: "reading_progresses" */
  insert_reading_progresses_one?: Maybe<Reading_Progresses>;
  /** insert data into the table: "subtitles" */
  insert_subtitles?: Maybe<Subtitles_Mutation_Response>;
  /** insert a single row into the table: "subtitles" */
  insert_subtitles_one?: Maybe<Subtitles>;
  /** insert data into the table: "user_video_history" */
  insert_user_video_history?: Maybe<User_Video_History_Mutation_Response>;
  /** insert a single row into the table: "user_video_history" */
  insert_user_video_history_one?: Maybe<User_Video_History>;
  /** insert data into the table: "video_views" */
  insert_video_views?: Maybe<Video_Views_Mutation_Response>;
  /** insert a single row into the table: "video_views" */
  insert_video_views_one?: Maybe<Video_Views>;
  /** insert data into the table: "videos" */
  insert_videos?: Maybe<Videos_Mutation_Response>;
  /** insert a single row into the table: "videos" */
  insert_videos_one?: Maybe<Videos>;
  /** update data of the table: "audios" */
  update_audios?: Maybe<Audios_Mutation_Response>;
  /** update single row of the table: "audios" */
  update_audios_by_pk?: Maybe<Audios>;
  /** update multiples rows of table: "audios" */
  update_audios_many?: Maybe<Array<Maybe<Audios_Mutation_Response>>>;
  /** update data of the table: "finance_transactions" */
  update_finance_transactions?: Maybe<Finance_Transactions_Mutation_Response>;
  /** update single row of the table: "finance_transactions" */
  update_finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** update multiples rows of table: "finance_transactions" */
  update_finance_transactions_many?: Maybe<
    Array<Maybe<Finance_Transactions_Mutation_Response>>
  >;
  /** update data of the table: "journals" */
  update_journals?: Maybe<Journals_Mutation_Response>;
  /** update single row of the table: "journals" */
  update_journals_by_pk?: Maybe<Journals>;
  /** update multiples rows of table: "journals" */
  update_journals_many?: Maybe<Array<Maybe<Journals_Mutation_Response>>>;
  /** update data of the table: "notifications" */
  update_notifications?: Maybe<Notifications_Mutation_Response>;
  /** update single row of the table: "notifications" */
  update_notifications_by_pk?: Maybe<Notifications>;
  /** update multiples rows of table: "notifications" */
  update_notifications_many?: Maybe<
    Array<Maybe<Notifications_Mutation_Response>>
  >;
  /** update data of the table: "playlist" */
  update_playlist?: Maybe<Playlist_Mutation_Response>;
  /** update single row of the table: "playlist" */
  update_playlist_by_pk?: Maybe<Playlist>;
  /** update multiples rows of table: "playlist" */
  update_playlist_many?: Maybe<Array<Maybe<Playlist_Mutation_Response>>>;
  /** update data of the table: "reading_progresses" */
  update_reading_progresses?: Maybe<Reading_Progresses_Mutation_Response>;
  /** update single row of the table: "reading_progresses" */
  update_reading_progresses_by_pk?: Maybe<Reading_Progresses>;
  /** update multiples rows of table: "reading_progresses" */
  update_reading_progresses_many?: Maybe<
    Array<Maybe<Reading_Progresses_Mutation_Response>>
  >;
  /** update data of the table: "subtitles" */
  update_subtitles?: Maybe<Subtitles_Mutation_Response>;
  /** update single row of the table: "subtitles" */
  update_subtitles_by_pk?: Maybe<Subtitles>;
  /** update multiples rows of table: "subtitles" */
  update_subtitles_many?: Maybe<Array<Maybe<Subtitles_Mutation_Response>>>;
  /** update data of the table: "user_video_history" */
  update_user_video_history?: Maybe<User_Video_History_Mutation_Response>;
  /** update single row of the table: "user_video_history" */
  update_user_video_history_by_pk?: Maybe<User_Video_History>;
  /** update multiples rows of table: "user_video_history" */
  update_user_video_history_many?: Maybe<
    Array<Maybe<User_Video_History_Mutation_Response>>
  >;
  /** update data of the table: "videos" */
  update_videos?: Maybe<Videos_Mutation_Response>;
  /** update single row of the table: "videos" */
  update_videos_by_pk?: Maybe<Videos>;
  /** update multiples rows of table: "videos" */
  update_videos_many?: Maybe<Array<Maybe<Videos_Mutation_Response>>>;
};

/** mutation root */
export type Mutation_RootCreateDeviceRequestArgs = {
  input: CreateDeviceRequestInput;
};

/** mutation root */
export type Mutation_RootDelete_AudiosArgs = {
  where: Audios_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Audios_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** mutation root */
export type Mutation_RootDelete_Finance_TransactionsArgs = {
  where: Finance_Transactions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Finance_Transactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** mutation root */
export type Mutation_RootDelete_JournalsArgs = {
  where: Journals_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Journals_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** mutation root */
export type Mutation_RootDelete_VideosArgs = {
  where: Videos_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Videos_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** mutation root */
export type Mutation_RootInsert_AudiosArgs = {
  objects: Array<Audios_Insert_Input>;
  on_conflict?: InputMaybe<Audios_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Audios_OneArgs = {
  object: Audios_Insert_Input;
  on_conflict?: InputMaybe<Audios_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Book_CommentsArgs = {
  objects: Array<Book_Comments_Insert_Input>;
  on_conflict?: InputMaybe<Book_Comments_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Book_Comments_OneArgs = {
  object: Book_Comments_Insert_Input;
  on_conflict?: InputMaybe<Book_Comments_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Crawl_RequestsArgs = {
  objects: Array<Crawl_Requests_Insert_Input>;
  on_conflict?: InputMaybe<Crawl_Requests_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Finance_TransactionsArgs = {
  objects: Array<Finance_Transactions_Insert_Input>;
  on_conflict?: InputMaybe<Finance_Transactions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Finance_Transactions_OneArgs = {
  object: Finance_Transactions_Insert_Input;
  on_conflict?: InputMaybe<Finance_Transactions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_JournalsArgs = {
  objects: Array<Journals_Insert_Input>;
  on_conflict?: InputMaybe<Journals_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Journals_OneArgs = {
  object: Journals_Insert_Input;
  on_conflict?: InputMaybe<Journals_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_PlaylistArgs = {
  objects: Array<Playlist_Insert_Input>;
  on_conflict?: InputMaybe<Playlist_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Playlist_OneArgs = {
  object: Playlist_Insert_Input;
  on_conflict?: InputMaybe<Playlist_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Playlist_VideosArgs = {
  objects: Array<Playlist_Videos_Insert_Input>;
  on_conflict?: InputMaybe<Playlist_Videos_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Playlist_Videos_OneArgs = {
  object: Playlist_Videos_Insert_Input;
  on_conflict?: InputMaybe<Playlist_Videos_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Reading_ProgressesArgs = {
  objects: Array<Reading_Progresses_Insert_Input>;
  on_conflict?: InputMaybe<Reading_Progresses_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Reading_Progresses_OneArgs = {
  object: Reading_Progresses_Insert_Input;
  on_conflict?: InputMaybe<Reading_Progresses_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_SubtitlesArgs = {
  objects: Array<Subtitles_Insert_Input>;
  on_conflict?: InputMaybe<Subtitles_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Subtitles_OneArgs = {
  object: Subtitles_Insert_Input;
  on_conflict?: InputMaybe<Subtitles_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Video_HistoryArgs = {
  objects: Array<User_Video_History_Insert_Input>;
  on_conflict?: InputMaybe<User_Video_History_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Video_History_OneArgs = {
  object: User_Video_History_Insert_Input;
  on_conflict?: InputMaybe<User_Video_History_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Video_ViewsArgs = {
  objects: Array<Video_Views_Insert_Input>;
  on_conflict?: InputMaybe<Video_Views_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Video_Views_OneArgs = {
  object: Video_Views_Insert_Input;
  on_conflict?: InputMaybe<Video_Views_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_VideosArgs = {
  objects: Array<Videos_Insert_Input>;
  on_conflict?: InputMaybe<Videos_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Videos_OneArgs = {
  object: Videos_Insert_Input;
  on_conflict?: InputMaybe<Videos_On_Conflict>;
};

/** mutation root */
export type Mutation_RootUpdate_AudiosArgs = {
  _set?: InputMaybe<Audios_Set_Input>;
  where: Audios_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Audios_By_PkArgs = {
  _set?: InputMaybe<Audios_Set_Input>;
  pk_columns: Audios_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Audios_ManyArgs = {
  updates: Array<Audios_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Finance_TransactionsArgs = {
  _inc?: InputMaybe<Finance_Transactions_Inc_Input>;
  _set?: InputMaybe<Finance_Transactions_Set_Input>;
  where: Finance_Transactions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Finance_Transactions_By_PkArgs = {
  _inc?: InputMaybe<Finance_Transactions_Inc_Input>;
  _set?: InputMaybe<Finance_Transactions_Set_Input>;
  pk_columns: Finance_Transactions_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Finance_Transactions_ManyArgs = {
  updates: Array<Finance_Transactions_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_JournalsArgs = {
  _append?: InputMaybe<Journals_Append_Input>;
  _delete_at_path?: InputMaybe<Journals_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Journals_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Journals_Delete_Key_Input>;
  _prepend?: InputMaybe<Journals_Prepend_Input>;
  _set?: InputMaybe<Journals_Set_Input>;
  where: Journals_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Journals_By_PkArgs = {
  _append?: InputMaybe<Journals_Append_Input>;
  _delete_at_path?: InputMaybe<Journals_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Journals_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Journals_Delete_Key_Input>;
  _prepend?: InputMaybe<Journals_Prepend_Input>;
  _set?: InputMaybe<Journals_Set_Input>;
  pk_columns: Journals_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Journals_ManyArgs = {
  updates: Array<Journals_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_NotificationsArgs = {
  _set?: InputMaybe<Notifications_Set_Input>;
  where: Notifications_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Notifications_By_PkArgs = {
  _set?: InputMaybe<Notifications_Set_Input>;
  pk_columns: Notifications_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Notifications_ManyArgs = {
  updates: Array<Notifications_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_PlaylistArgs = {
  _append?: InputMaybe<Playlist_Append_Input>;
  _delete_at_path?: InputMaybe<Playlist_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Playlist_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Playlist_Delete_Key_Input>;
  _prepend?: InputMaybe<Playlist_Prepend_Input>;
  _set?: InputMaybe<Playlist_Set_Input>;
  where: Playlist_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Playlist_By_PkArgs = {
  _append?: InputMaybe<Playlist_Append_Input>;
  _delete_at_path?: InputMaybe<Playlist_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Playlist_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Playlist_Delete_Key_Input>;
  _prepend?: InputMaybe<Playlist_Prepend_Input>;
  _set?: InputMaybe<Playlist_Set_Input>;
  pk_columns: Playlist_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Playlist_ManyArgs = {
  updates: Array<Playlist_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Reading_ProgressesArgs = {
  _inc?: InputMaybe<Reading_Progresses_Inc_Input>;
  _set?: InputMaybe<Reading_Progresses_Set_Input>;
  where: Reading_Progresses_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Reading_Progresses_By_PkArgs = {
  _inc?: InputMaybe<Reading_Progresses_Inc_Input>;
  _set?: InputMaybe<Reading_Progresses_Set_Input>;
  pk_columns: Reading_Progresses_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Reading_Progresses_ManyArgs = {
  updates: Array<Reading_Progresses_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_SubtitlesArgs = {
  _set?: InputMaybe<Subtitles_Set_Input>;
  where: Subtitles_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Subtitles_By_PkArgs = {
  _set?: InputMaybe<Subtitles_Set_Input>;
  pk_columns: Subtitles_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Subtitles_ManyArgs = {
  updates: Array<Subtitles_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_User_Video_HistoryArgs = {
  _inc?: InputMaybe<User_Video_History_Inc_Input>;
  _set?: InputMaybe<User_Video_History_Set_Input>;
  where: User_Video_History_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_User_Video_History_By_PkArgs = {
  _inc?: InputMaybe<User_Video_History_Inc_Input>;
  _set?: InputMaybe<User_Video_History_Set_Input>;
  pk_columns: User_Video_History_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_User_Video_History_ManyArgs = {
  updates: Array<User_Video_History_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_VideosArgs = {
  _append?: InputMaybe<Videos_Append_Input>;
  _delete_at_path?: InputMaybe<Videos_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Videos_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Videos_Delete_Key_Input>;
  _prepend?: InputMaybe<Videos_Prepend_Input>;
  _set?: InputMaybe<Videos_Set_Input>;
  where: Videos_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Videos_By_PkArgs = {
  _append?: InputMaybe<Videos_Append_Input>;
  _delete_at_path?: InputMaybe<Videos_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Videos_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Videos_Delete_Key_Input>;
  _prepend?: InputMaybe<Videos_Prepend_Input>;
  _set?: InputMaybe<Videos_Set_Input>;
  pk_columns: Videos_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Videos_ManyArgs = {
  updates: Array<Videos_Updates>;
};

/** Notification system */
export type Notifications = {
  __typename?: 'notifications';
  createdAt: Scalars['timestamptz']['output'];
  entityId: Scalars['uuid']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  link?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['jsonb']['output']>;
  readAt?: Maybe<Scalars['timestamptz']['output']>;
  type: Scalars['String']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
  /** An object relationship */
  video?: Maybe<Videos>;
};

/** Notification system */
export type NotificationsMetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** order by aggregate values of table "notifications" */
export type Notifications_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Notifications_Max_Order_By>;
  min?: InputMaybe<Notifications_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "notifications". All fields are combined with a logical 'AND'. */
export type Notifications_Bool_Exp = {
  _and?: InputMaybe<Array<Notifications_Bool_Exp>>;
  _not?: InputMaybe<Notifications_Bool_Exp>;
  _or?: InputMaybe<Array<Notifications_Bool_Exp>>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  entityId?: InputMaybe<Uuid_Comparison_Exp>;
  entityType?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  link?: InputMaybe<String_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  readAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
};

/** order by max() on columns of table "notifications" */
export type Notifications_Max_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  entityId?: InputMaybe<Order_By>;
  entityType?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  link?: InputMaybe<Order_By>;
  readAt?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "notifications" */
export type Notifications_Min_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  entityId?: InputMaybe<Order_By>;
  entityType?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  link?: InputMaybe<Order_By>;
  readAt?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "notifications" */
export type Notifications_Mutation_Response = {
  __typename?: 'notifications_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Notifications>;
};

/** Ordering options when selecting data from "notifications". */
export type Notifications_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  entityId?: InputMaybe<Order_By>;
  entityType?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  link?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  readAt?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
};

/** primary key columns input for table: notifications */
export type Notifications_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "notifications" */
export enum Notifications_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  EntityId = 'entityId',
  /** column name */
  EntityType = 'entityType',
  /** column name */
  Id = 'id',
  /** column name */
  Link = 'link',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  ReadAt = 'readAt',
  /** column name */
  Type = 'type',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "notifications" */
export type Notifications_Set_Input = {
  readAt?: InputMaybe<Scalars['timestamptz']['input']>;
};

export type Notifications_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Notifications_Set_Input>;
  /** filter the rows which have to be updated */
  where: Notifications_Bool_Exp;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last',
}

/** Playlist contain set of videos or audios */
export type Playlist = {
  __typename?: 'playlist';
  createdAt: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  /** An array relationship */
  playlist_videos: Array<Playlist_Videos>;
  /** An aggregate relationship */
  playlist_videos_aggregate: Playlist_Videos_Aggregate;
  public: Scalars['Boolean']['output'];
  /** Short id like Youtube video id */
  sId?: Maybe<Scalars['String']['output']>;
  /** List of shared recipient emails after validated by the system, should use this field to show for end users. Only system can update this field. End user should NOT know the real shared user ids. */
  sharedRecipients?: Maybe<Scalars['jsonb']['output']>;
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: Maybe<Scalars['jsonb']['output']>;
  slug: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
};

/** Playlist contain set of videos or audios */
export type PlaylistPlaylist_VideosArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};

/** Playlist contain set of videos or audios */
export type PlaylistPlaylist_Videos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};

/** Playlist contain set of videos or audios */
export type PlaylistSharedRecipientsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** Playlist contain set of videos or audios */
export type PlaylistSharedRecipientsInputArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** order by aggregate values of table "playlist" */
export type Playlist_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Playlist_Max_Order_By>;
  min?: InputMaybe<Playlist_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Playlist_Append_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "playlist". All fields are combined with a logical 'AND'. */
export type Playlist_Bool_Exp = {
  _and?: InputMaybe<Array<Playlist_Bool_Exp>>;
  _not?: InputMaybe<Playlist_Bool_Exp>;
  _or?: InputMaybe<Array<Playlist_Bool_Exp>>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  playlist_videos?: InputMaybe<Playlist_Videos_Bool_Exp>;
  playlist_videos_aggregate?: InputMaybe<Playlist_Videos_Aggregate_Bool_Exp>;
  public?: InputMaybe<Boolean_Comparison_Exp>;
  sId?: InputMaybe<String_Comparison_Exp>;
  sharedRecipients?: InputMaybe<Jsonb_Comparison_Exp>;
  sharedRecipientsInput?: InputMaybe<Jsonb_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  thumbnailUrl?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "playlist" */
export enum Playlist_Constraint {
  /** unique or primary key constraint on columns "id" */
  PlaylistPkey = 'playlist_pkey',
  /** unique or primary key constraint on columns "s_id" */
  PlaylistSIdKey = 'playlist_s_id_key',
  /** unique or primary key constraint on columns "user_id", "slug" */
  PlaylistUserIdSlugKey = 'playlist_user_id_slug_key',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Playlist_Delete_At_Path_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Playlist_Delete_Elem_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Playlist_Delete_Key_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "playlist" */
export type Playlist_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  playlist_videos?: InputMaybe<Playlist_Videos_Arr_Rel_Insert_Input>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** order by max() on columns of table "playlist" */
export type Playlist_Max_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Short id like Youtube video id */
  sId?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "playlist" */
export type Playlist_Min_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Short id like Youtube video id */
  sId?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "playlist" */
export type Playlist_Mutation_Response = {
  __typename?: 'playlist_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Playlist>;
};

/** input type for inserting object relation for remote table "playlist" */
export type Playlist_Obj_Rel_Insert_Input = {
  data: Playlist_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Playlist_On_Conflict>;
};

/** on_conflict condition type for table "playlist" */
export type Playlist_On_Conflict = {
  constraint: Playlist_Constraint;
  update_columns?: Array<Playlist_Update_Column>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};

/** Ordering options when selecting data from "playlist". */
export type Playlist_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  playlist_videos_aggregate?: InputMaybe<Playlist_Videos_Aggregate_Order_By>;
  public?: InputMaybe<Order_By>;
  sId?: InputMaybe<Order_By>;
  sharedRecipients?: InputMaybe<Order_By>;
  sharedRecipientsInput?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: playlist */
export type Playlist_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Playlist_Prepend_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "playlist" */
export enum Playlist_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Public = 'public',
  /** column name */
  SId = 'sId',
  /** column name */
  SharedRecipients = 'sharedRecipients',
  /** column name */
  SharedRecipientsInput = 'sharedRecipientsInput',
  /** column name */
  Slug = 'slug',
  /** column name */
  ThumbnailUrl = 'thumbnailUrl',
  /** column name */
  Title = 'title',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "playlist" */
export type Playlist_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "playlist" */
export type Playlist_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Playlist_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Playlist_Stream_Cursor_Value_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** Short id like Youtube video id */
  sId?: InputMaybe<Scalars['String']['input']>;
  /** List of shared recipient emails after validated by the system, should use this field to show for end users. Only system can update this field. End user should NOT know the real shared user ids. */
  sharedRecipients?: InputMaybe<Scalars['jsonb']['input']>;
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "playlist" */
export enum Playlist_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Public = 'public',
  /** column name */
  SharedRecipientsInput = 'sharedRecipientsInput',
  /** column name */
  Title = 'title',
}

export type Playlist_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Playlist_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Playlist_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Playlist_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Playlist_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Playlist_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Playlist_Set_Input>;
  /** filter the rows which have to be updated */
  where: Playlist_Bool_Exp;
};

/** Junction table between videos and playlist */
export type Playlist_Videos = {
  __typename?: 'playlist_videos';
  /** An object relationship */
  playlist: Playlist;
  position: Scalars['Int']['output'];
  /** An object relationship */
  video: Videos;
};

/** aggregated selection of "playlist_videos" */
export type Playlist_Videos_Aggregate = {
  __typename?: 'playlist_videos_aggregate';
  aggregate?: Maybe<Playlist_Videos_Aggregate_Fields>;
  nodes: Array<Playlist_Videos>;
};

export type Playlist_Videos_Aggregate_Bool_Exp = {
  count?: InputMaybe<Playlist_Videos_Aggregate_Bool_Exp_Count>;
};

export type Playlist_Videos_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Playlist_Videos_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "playlist_videos" */
export type Playlist_Videos_Aggregate_Fields = {
  __typename?: 'playlist_videos_aggregate_fields';
  avg?: Maybe<Playlist_Videos_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Playlist_Videos_Max_Fields>;
  min?: Maybe<Playlist_Videos_Min_Fields>;
  stddev?: Maybe<Playlist_Videos_Stddev_Fields>;
  stddev_pop?: Maybe<Playlist_Videos_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Playlist_Videos_Stddev_Samp_Fields>;
  sum?: Maybe<Playlist_Videos_Sum_Fields>;
  var_pop?: Maybe<Playlist_Videos_Var_Pop_Fields>;
  var_samp?: Maybe<Playlist_Videos_Var_Samp_Fields>;
  variance?: Maybe<Playlist_Videos_Variance_Fields>;
};

/** aggregate fields of "playlist_videos" */
export type Playlist_Videos_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "playlist_videos" */
export type Playlist_Videos_Aggregate_Order_By = {
  avg?: InputMaybe<Playlist_Videos_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Playlist_Videos_Max_Order_By>;
  min?: InputMaybe<Playlist_Videos_Min_Order_By>;
  stddev?: InputMaybe<Playlist_Videos_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Playlist_Videos_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Playlist_Videos_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Playlist_Videos_Sum_Order_By>;
  var_pop?: InputMaybe<Playlist_Videos_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Playlist_Videos_Var_Samp_Order_By>;
  variance?: InputMaybe<Playlist_Videos_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "playlist_videos" */
export type Playlist_Videos_Arr_Rel_Insert_Input = {
  data: Array<Playlist_Videos_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Playlist_Videos_On_Conflict>;
};

/** aggregate avg on columns */
export type Playlist_Videos_Avg_Fields = {
  __typename?: 'playlist_videos_avg_fields';
  position?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "playlist_videos" */
export type Playlist_Videos_Avg_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "playlist_videos". All fields are combined with a logical 'AND'. */
export type Playlist_Videos_Bool_Exp = {
  _and?: InputMaybe<Array<Playlist_Videos_Bool_Exp>>;
  _not?: InputMaybe<Playlist_Videos_Bool_Exp>;
  _or?: InputMaybe<Array<Playlist_Videos_Bool_Exp>>;
  playlist?: InputMaybe<Playlist_Bool_Exp>;
  position?: InputMaybe<Int_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
};

/** unique or primary key constraints on table "playlist_videos" */
export enum Playlist_Videos_Constraint {
  /** unique or primary key constraint on columns "video_id", "playlist_id" */
  PlaylistVideosPkey = 'playlist_videos_pkey',
  /** unique or primary key constraint on columns "video_id", "playlist_id" */
  PlaylistVideosPlaylistIdVideoIdKey = 'playlist_videos_playlist_id_video_id_key',
}

/** input type for inserting data into table "playlist_videos" */
export type Playlist_Videos_Insert_Input = {
  playlist?: InputMaybe<Playlist_Obj_Rel_Insert_Input>;
  playlist_id?: InputMaybe<Scalars['uuid']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Playlist_Videos_Max_Fields = {
  __typename?: 'playlist_videos_max_fields';
  position?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "playlist_videos" */
export type Playlist_Videos_Max_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Playlist_Videos_Min_Fields = {
  __typename?: 'playlist_videos_min_fields';
  position?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "playlist_videos" */
export type Playlist_Videos_Min_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "playlist_videos" */
export type Playlist_Videos_Mutation_Response = {
  __typename?: 'playlist_videos_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Playlist_Videos>;
};

/** on_conflict condition type for table "playlist_videos" */
export type Playlist_Videos_On_Conflict = {
  constraint: Playlist_Videos_Constraint;
  update_columns?: Array<Playlist_Videos_Update_Column>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};

/** Ordering options when selecting data from "playlist_videos". */
export type Playlist_Videos_Order_By = {
  playlist?: InputMaybe<Playlist_Order_By>;
  position?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
};

/** select columns of table "playlist_videos" */
export enum Playlist_Videos_Select_Column {
  /** column name */
  Position = 'position',
}

/** aggregate stddev on columns */
export type Playlist_Videos_Stddev_Fields = {
  __typename?: 'playlist_videos_stddev_fields';
  position?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "playlist_videos" */
export type Playlist_Videos_Stddev_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Playlist_Videos_Stddev_Pop_Fields = {
  __typename?: 'playlist_videos_stddev_pop_fields';
  position?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "playlist_videos" */
export type Playlist_Videos_Stddev_Pop_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Playlist_Videos_Stddev_Samp_Fields = {
  __typename?: 'playlist_videos_stddev_samp_fields';
  position?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "playlist_videos" */
export type Playlist_Videos_Stddev_Samp_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Playlist_Videos_Sum_Fields = {
  __typename?: 'playlist_videos_sum_fields';
  position?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "playlist_videos" */
export type Playlist_Videos_Sum_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** placeholder for update columns of table "playlist_videos" (current role has no relevant permissions) */
export enum Playlist_Videos_Update_Column {
  /** placeholder (do not use) */
  Placeholder = '_PLACEHOLDER',
}

/** aggregate var_pop on columns */
export type Playlist_Videos_Var_Pop_Fields = {
  __typename?: 'playlist_videos_var_pop_fields';
  position?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "playlist_videos" */
export type Playlist_Videos_Var_Pop_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Playlist_Videos_Var_Samp_Fields = {
  __typename?: 'playlist_videos_var_samp_fields';
  position?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "playlist_videos" */
export type Playlist_Videos_Var_Samp_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Playlist_Videos_Variance_Fields = {
  __typename?: 'playlist_videos_variance_fields';
  position?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "playlist_videos" */
export type Playlist_Videos_Variance_Order_By = {
  position?: InputMaybe<Order_By>;
};

/** Blog posts initial idea is fetch from hashnode for til */
export type Posts = {
  __typename?: 'posts';
  brief: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  markdownContent: Scalars['String']['output'];
  readTimeInMinutes: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

/** Boolean expression to filter rows from the table "posts". All fields are combined with a logical 'AND'. */
export type Posts_Bool_Exp = {
  _and?: InputMaybe<Array<Posts_Bool_Exp>>;
  _not?: InputMaybe<Posts_Bool_Exp>;
  _or?: InputMaybe<Array<Posts_Bool_Exp>>;
  brief?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  markdownContent?: InputMaybe<String_Comparison_Exp>;
  readTimeInMinutes?: InputMaybe<Int_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
};

/** Ordering options when selecting data from "posts". */
export type Posts_Order_By = {
  brief?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  markdownContent?: InputMaybe<Order_By>;
  readTimeInMinutes?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
};

/** select columns of table "posts" */
export enum Posts_Select_Column {
  /** column name */
  Brief = 'brief',
  /** column name */
  Id = 'id',
  /** column name */
  MarkdownContent = 'markdownContent',
  /** column name */
  ReadTimeInMinutes = 'readTimeInMinutes',
  /** column name */
  Slug = 'slug',
  /** column name */
  Title = 'title',
}

export type Query_Root = {
  __typename?: 'query_root';
  /** An array relationship */
  audio_tags: Array<Audio_Tags>;
  /** fetch data from the table: "audio_tags" using primary key columns */
  audio_tags_by_pk?: Maybe<Audio_Tags>;
  /** An array relationship */
  audios: Array<Audios>;
  /** fetch data from the table: "audios" using primary key columns */
  audios_by_pk?: Maybe<Audios>;
  /** An array relationship */
  book_comments: Array<Book_Comments>;
  /** An array relationship */
  books: Array<Books>;
  /** An aggregate relationship */
  books_aggregate: Books_Aggregate;
  /** fetch data from the table: "books" using primary key columns */
  books_by_pk?: Maybe<Books>;
  /** fetch data from the table: "feature_flag" */
  feature_flag: Array<Feature_Flag>;
  /** fetch data from the table: "feature_flag" using primary key columns */
  feature_flag_by_pk?: Maybe<Feature_Flag>;
  /** An array relationship */
  finance_transactions: Array<Finance_Transactions>;
  /** An aggregate relationship */
  finance_transactions_aggregate: Finance_Transactions_Aggregate;
  /** fetch data from the table: "finance_transactions" using primary key columns */
  finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** An array relationship */
  journals: Array<Journals>;
  /** An aggregate relationship */
  journals_aggregate: Journals_Aggregate;
  /** fetch data from the table: "journals" using primary key columns */
  journals_by_pk?: Maybe<Journals>;
  /** fetch data from the table: "playlist" */
  playlist: Array<Playlist>;
  /** fetch data from the table: "playlist" using primary key columns */
  playlist_by_pk?: Maybe<Playlist>;
  /** fetch data from the table: "posts" */
  posts: Array<Posts>;
  /** fetch data from the table: "posts" using primary key columns */
  posts_by_pk?: Maybe<Posts>;
  /** An array relationship */
  reading_progresses: Array<Reading_Progresses>;
  /** An aggregate relationship */
  reading_progresses_aggregate: Reading_Progresses_Aggregate;
  /** fetch data from the table: "tags" */
  tags: Array<Tags>;
  /** fetch data from the table: "tags" using primary key columns */
  tags_by_pk?: Maybe<Tags>;
  /** fetch data from the table: "user_video_history" */
  user_video_history: Array<User_Video_History>;
  /** fetch data from the table: "user_video_history" using primary key columns */
  user_video_history_by_pk?: Maybe<User_Video_History>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** An array relationship */
  video_tags: Array<Video_Tags>;
  /** fetch data from the table: "video_tags" using primary key columns */
  video_tags_by_pk?: Maybe<Video_Tags>;
  /** An array relationship */
  video_views: Array<Video_Views>;
  /** An aggregate relationship */
  video_views_aggregate: Video_Views_Aggregate;
  /** fetch data from the table: "video_views" using primary key columns */
  video_views_by_pk?: Maybe<Video_Views>;
  /** An array relationship */
  videos: Array<Videos>;
  /** fetch data from the table: "videos" using primary key columns */
  videos_by_pk?: Maybe<Videos>;
};

export type Query_RootAudio_TagsArgs = {
  distinct_on?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audio_Tags_Order_By>>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};

export type Query_RootAudio_Tags_By_PkArgs = {
  audio_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
};

export type Query_RootAudiosArgs = {
  distinct_on?: InputMaybe<Array<Audios_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audios_Order_By>>;
  where?: InputMaybe<Audios_Bool_Exp>;
};

export type Query_RootAudios_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootBook_CommentsArgs = {
  distinct_on?: InputMaybe<Array<Book_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Book_Comments_Order_By>>;
  where?: InputMaybe<Book_Comments_Bool_Exp>;
};

export type Query_RootBooksArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};

export type Query_RootBooks_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};

export type Query_RootBooks_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootFeature_FlagArgs = {
  distinct_on?: InputMaybe<Array<Feature_Flag_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Feature_Flag_Order_By>>;
  where?: InputMaybe<Feature_Flag_Bool_Exp>;
};

export type Query_RootFeature_Flag_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootFinance_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Finance_Transactions_Order_By>>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};

export type Query_RootFinance_Transactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Finance_Transactions_Order_By>>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};

export type Query_RootFinance_Transactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootJournalsArgs = {
  distinct_on?: InputMaybe<Array<Journals_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Journals_Order_By>>;
  where?: InputMaybe<Journals_Bool_Exp>;
};

export type Query_RootJournals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Journals_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Journals_Order_By>>;
  where?: InputMaybe<Journals_Bool_Exp>;
};

export type Query_RootJournals_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootPlaylistArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Order_By>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};

export type Query_RootPlaylist_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootPostsArgs = {
  distinct_on?: InputMaybe<Array<Posts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Posts_Order_By>>;
  where?: InputMaybe<Posts_Bool_Exp>;
};

export type Query_RootPosts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootReading_ProgressesArgs = {
  distinct_on?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reading_Progresses_Order_By>>;
  where?: InputMaybe<Reading_Progresses_Bool_Exp>;
};

export type Query_RootReading_Progresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reading_Progresses_Order_By>>;
  where?: InputMaybe<Reading_Progresses_Bool_Exp>;
};

export type Query_RootTagsArgs = {
  distinct_on?: InputMaybe<Array<Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tags_Order_By>>;
  where?: InputMaybe<Tags_Bool_Exp>;
};

export type Query_RootTags_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootUser_Video_HistoryArgs = {
  distinct_on?: InputMaybe<Array<User_Video_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Video_History_Order_By>>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};

export type Query_RootUser_Video_History_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Query_RootVideo_TagsArgs = {
  distinct_on?: InputMaybe<Array<Video_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Tags_Order_By>>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};

export type Query_RootVideo_Tags_By_PkArgs = {
  tag_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};

export type Query_RootVideo_ViewsArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

export type Query_RootVideo_Views_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

export type Query_RootVideo_Views_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Query_RootVideosArgs = {
  distinct_on?: InputMaybe<Array<Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Videos_Order_By>>;
  where?: InputMaybe<Videos_Bool_Exp>;
};

export type Query_RootVideos_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

/** Track how far end user read a book */
export type Reading_Progresses = {
  __typename?: 'reading_progresses';
  /** An object relationship */
  book: Books;
  bookId: Scalars['uuid']['output'];
  createdAt: Scalars['timestamptz']['output'];
  currentPage: Scalars['Int']['output'];
  id: Scalars['uuid']['output'];
  lastReadAt: Scalars['timestamptz']['output'];
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Int']['output']>;
  totalPages: Scalars['Int']['output'];
  /** An object relationship */
  user: Users;
};

/** aggregated selection of "reading_progresses" */
export type Reading_Progresses_Aggregate = {
  __typename?: 'reading_progresses_aggregate';
  aggregate?: Maybe<Reading_Progresses_Aggregate_Fields>;
  nodes: Array<Reading_Progresses>;
};

export type Reading_Progresses_Aggregate_Bool_Exp = {
  count?: InputMaybe<Reading_Progresses_Aggregate_Bool_Exp_Count>;
};

export type Reading_Progresses_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Reading_Progresses_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "reading_progresses" */
export type Reading_Progresses_Aggregate_Fields = {
  __typename?: 'reading_progresses_aggregate_fields';
  avg?: Maybe<Reading_Progresses_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Reading_Progresses_Max_Fields>;
  min?: Maybe<Reading_Progresses_Min_Fields>;
  stddev?: Maybe<Reading_Progresses_Stddev_Fields>;
  stddev_pop?: Maybe<Reading_Progresses_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Reading_Progresses_Stddev_Samp_Fields>;
  sum?: Maybe<Reading_Progresses_Sum_Fields>;
  var_pop?: Maybe<Reading_Progresses_Var_Pop_Fields>;
  var_samp?: Maybe<Reading_Progresses_Var_Samp_Fields>;
  variance?: Maybe<Reading_Progresses_Variance_Fields>;
};

/** aggregate fields of "reading_progresses" */
export type Reading_Progresses_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "reading_progresses" */
export type Reading_Progresses_Aggregate_Order_By = {
  avg?: InputMaybe<Reading_Progresses_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Reading_Progresses_Max_Order_By>;
  min?: InputMaybe<Reading_Progresses_Min_Order_By>;
  stddev?: InputMaybe<Reading_Progresses_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Reading_Progresses_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Reading_Progresses_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Reading_Progresses_Sum_Order_By>;
  var_pop?: InputMaybe<Reading_Progresses_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Reading_Progresses_Var_Samp_Order_By>;
  variance?: InputMaybe<Reading_Progresses_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Reading_Progresses_Avg_Fields = {
  __typename?: 'reading_progresses_avg_fields';
  currentPage?: Maybe<Scalars['Float']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Float']['output']>;
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "reading_progresses" */
export type Reading_Progresses_Avg_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "reading_progresses". All fields are combined with a logical 'AND'. */
export type Reading_Progresses_Bool_Exp = {
  _and?: InputMaybe<Array<Reading_Progresses_Bool_Exp>>;
  _not?: InputMaybe<Reading_Progresses_Bool_Exp>;
  _or?: InputMaybe<Array<Reading_Progresses_Bool_Exp>>;
  book?: InputMaybe<Books_Bool_Exp>;
  bookId?: InputMaybe<Uuid_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  currentPage?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  lastReadAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  percentage?: InputMaybe<Numeric_Comparison_Exp>;
  readingTimeMinutes?: InputMaybe<Int_Comparison_Exp>;
  totalPages?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
};

/** unique or primary key constraints on table "reading_progresses" */
export enum Reading_Progresses_Constraint {
  /** unique or primary key constraint on columns "id" */
  ReadingProgressesPkey = 'reading_progresses_pkey',
  /** unique or primary key constraint on columns "user_id", "book_id" */
  ReadingProgressesUserIdBookIdKey = 'reading_progresses_user_id_book_id_key',
}

/** input type for incrementing numeric columns in table "reading_progresses" */
export type Reading_Progresses_Inc_Input = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  readingTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "reading_progresses" */
export type Reading_Progresses_Insert_Input = {
  bookId?: InputMaybe<Scalars['uuid']['input']>;
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  lastReadAt?: InputMaybe<Scalars['timestamptz']['input']>;
  readingTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  totalPages?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Reading_Progresses_Max_Fields = {
  __typename?: 'reading_progresses_max_fields';
  bookId?: Maybe<Scalars['uuid']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  currentPage?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lastReadAt?: Maybe<Scalars['timestamptz']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Int']['output']>;
  totalPages?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "reading_progresses" */
export type Reading_Progresses_Max_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  currentPage?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lastReadAt?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Reading_Progresses_Min_Fields = {
  __typename?: 'reading_progresses_min_fields';
  bookId?: Maybe<Scalars['uuid']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  currentPage?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lastReadAt?: Maybe<Scalars['timestamptz']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Int']['output']>;
  totalPages?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "reading_progresses" */
export type Reading_Progresses_Min_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  currentPage?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lastReadAt?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "reading_progresses" */
export type Reading_Progresses_Mutation_Response = {
  __typename?: 'reading_progresses_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Reading_Progresses>;
};

/** on_conflict condition type for table "reading_progresses" */
export type Reading_Progresses_On_Conflict = {
  constraint: Reading_Progresses_Constraint;
  update_columns?: Array<Reading_Progresses_Update_Column>;
  where?: InputMaybe<Reading_Progresses_Bool_Exp>;
};

/** Ordering options when selecting data from "reading_progresses". */
export type Reading_Progresses_Order_By = {
  book?: InputMaybe<Books_Order_By>;
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  currentPage?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lastReadAt?: InputMaybe<Order_By>;
  percentage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
};

/** primary key columns input for table: reading_progresses */
export type Reading_Progresses_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "reading_progresses" */
export enum Reading_Progresses_Select_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  CurrentPage = 'currentPage',
  /** column name */
  Id = 'id',
  /** column name */
  LastReadAt = 'lastReadAt',
  /** column name */
  ReadingTimeMinutes = 'readingTimeMinutes',
  /** column name */
  TotalPages = 'totalPages',
}

/** input type for updating data in table "reading_progresses" */
export type Reading_Progresses_Set_Input = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  lastReadAt?: InputMaybe<Scalars['timestamptz']['input']>;
  readingTimeMinutes?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Reading_Progresses_Stddev_Fields = {
  __typename?: 'reading_progresses_stddev_fields';
  currentPage?: Maybe<Scalars['Float']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Float']['output']>;
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "reading_progresses" */
export type Reading_Progresses_Stddev_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Reading_Progresses_Stddev_Pop_Fields = {
  __typename?: 'reading_progresses_stddev_pop_fields';
  currentPage?: Maybe<Scalars['Float']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Float']['output']>;
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "reading_progresses" */
export type Reading_Progresses_Stddev_Pop_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Reading_Progresses_Stddev_Samp_Fields = {
  __typename?: 'reading_progresses_stddev_samp_fields';
  currentPage?: Maybe<Scalars['Float']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Float']['output']>;
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "reading_progresses" */
export type Reading_Progresses_Stddev_Samp_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Reading_Progresses_Sum_Fields = {
  __typename?: 'reading_progresses_sum_fields';
  currentPage?: Maybe<Scalars['Int']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Int']['output']>;
  totalPages?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "reading_progresses" */
export type Reading_Progresses_Sum_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** update columns of table "reading_progresses" */
export enum Reading_Progresses_Update_Column {
  /** column name */
  CurrentPage = 'currentPage',
  /** column name */
  LastReadAt = 'lastReadAt',
  /** column name */
  ReadingTimeMinutes = 'readingTimeMinutes',
}

export type Reading_Progresses_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Reading_Progresses_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Reading_Progresses_Set_Input>;
  /** filter the rows which have to be updated */
  where: Reading_Progresses_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Reading_Progresses_Var_Pop_Fields = {
  __typename?: 'reading_progresses_var_pop_fields';
  currentPage?: Maybe<Scalars['Float']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Float']['output']>;
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "reading_progresses" */
export type Reading_Progresses_Var_Pop_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Reading_Progresses_Var_Samp_Fields = {
  __typename?: 'reading_progresses_var_samp_fields';
  currentPage?: Maybe<Scalars['Float']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Float']['output']>;
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "reading_progresses" */
export type Reading_Progresses_Var_Samp_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Reading_Progresses_Variance_Fields = {
  __typename?: 'reading_progresses_variance_fields';
  currentPage?: Maybe<Scalars['Float']['output']>;
  /** Calculate percentage based on other column values */
  percentage?: Maybe<Scalars['numeric']['output']>;
  readingTimeMinutes?: Maybe<Scalars['Float']['output']>;
  totalPages?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "reading_progresses" */
export type Reading_Progresses_Variance_Order_By = {
  currentPage?: InputMaybe<Order_By>;
  readingTimeMinutes?: InputMaybe<Order_By>;
  totalPages?: InputMaybe<Order_By>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** An array relationship */
  audio_tags: Array<Audio_Tags>;
  /** fetch data from the table: "audio_tags" using primary key columns */
  audio_tags_by_pk?: Maybe<Audio_Tags>;
  /** fetch data from the table in a streaming manner: "audio_tags" */
  audio_tags_stream: Array<Audio_Tags>;
  /** An array relationship */
  audios: Array<Audios>;
  /** fetch data from the table: "audios" using primary key columns */
  audios_by_pk?: Maybe<Audios>;
  /** fetch data from the table in a streaming manner: "audios" */
  audios_stream: Array<Audios>;
  /** An array relationship */
  books: Array<Books>;
  /** fetch data from the table: "books" using primary key columns */
  books_by_pk?: Maybe<Books>;
  /** fetch data from the table: "feature_flag" */
  feature_flag: Array<Feature_Flag>;
  /** fetch data from the table: "feature_flag" using primary key columns */
  feature_flag_by_pk?: Maybe<Feature_Flag>;
  /** fetch data from the table in a streaming manner: "feature_flag" */
  feature_flag_stream: Array<Feature_Flag>;
  /** An array relationship */
  finance_transactions: Array<Finance_Transactions>;
  /** An aggregate relationship */
  finance_transactions_aggregate: Finance_Transactions_Aggregate;
  /** fetch data from the table: "finance_transactions" using primary key columns */
  finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** An array relationship */
  notifications: Array<Notifications>;
  /** fetch data from the table: "playlist" */
  playlist: Array<Playlist>;
  /** fetch data from the table: "playlist" using primary key columns */
  playlist_by_pk?: Maybe<Playlist>;
  /** fetch data from the table in a streaming manner: "playlist" */
  playlist_stream: Array<Playlist>;
  /** fetch data from the table: "tags" */
  tags: Array<Tags>;
  /** fetch data from the table: "tags" using primary key columns */
  tags_by_pk?: Maybe<Tags>;
  /** fetch data from the table in a streaming manner: "tags" */
  tags_stream: Array<Tags>;
  /** fetch data from the table: "user_video_history" */
  user_video_history: Array<User_Video_History>;
  /** fetch data from the table: "user_video_history" using primary key columns */
  user_video_history_by_pk?: Maybe<User_Video_History>;
  /** fetch data from the table in a streaming manner: "user_video_history" */
  user_video_history_stream: Array<User_Video_History>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
  /** An array relationship */
  video_tags: Array<Video_Tags>;
  /** fetch data from the table: "video_tags" using primary key columns */
  video_tags_by_pk?: Maybe<Video_Tags>;
  /** fetch data from the table in a streaming manner: "video_tags" */
  video_tags_stream: Array<Video_Tags>;
  /** An array relationship */
  video_views: Array<Video_Views>;
  /** An aggregate relationship */
  video_views_aggregate: Video_Views_Aggregate;
  /** fetch data from the table: "video_views" using primary key columns */
  video_views_by_pk?: Maybe<Video_Views>;
  /** fetch data from the table in a streaming manner: "video_views" */
  video_views_stream: Array<Video_Views>;
  /** An array relationship */
  videos: Array<Videos>;
  /** fetch data from the table: "videos" using primary key columns */
  videos_by_pk?: Maybe<Videos>;
  /** fetch data from the table in a streaming manner: "videos" */
  videos_stream: Array<Videos>;
};

export type Subscription_RootAudio_TagsArgs = {
  distinct_on?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audio_Tags_Order_By>>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};

export type Subscription_RootAudio_Tags_By_PkArgs = {
  audio_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
};

export type Subscription_RootAudio_Tags_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Audio_Tags_Stream_Cursor_Input>>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};

export type Subscription_RootAudiosArgs = {
  distinct_on?: InputMaybe<Array<Audios_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audios_Order_By>>;
  where?: InputMaybe<Audios_Bool_Exp>;
};

export type Subscription_RootAudios_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootAudios_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Audios_Stream_Cursor_Input>>;
  where?: InputMaybe<Audios_Bool_Exp>;
};

export type Subscription_RootBooksArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};

export type Subscription_RootBooks_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootFeature_FlagArgs = {
  distinct_on?: InputMaybe<Array<Feature_Flag_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Feature_Flag_Order_By>>;
  where?: InputMaybe<Feature_Flag_Bool_Exp>;
};

export type Subscription_RootFeature_Flag_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootFeature_Flag_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Feature_Flag_Stream_Cursor_Input>>;
  where?: InputMaybe<Feature_Flag_Bool_Exp>;
};

export type Subscription_RootFinance_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Finance_Transactions_Order_By>>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};

export type Subscription_RootFinance_Transactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Finance_Transactions_Order_By>>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};

export type Subscription_RootFinance_Transactions_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

export type Subscription_RootPlaylistArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Order_By>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};

export type Subscription_RootPlaylist_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootPlaylist_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Playlist_Stream_Cursor_Input>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};

export type Subscription_RootTagsArgs = {
  distinct_on?: InputMaybe<Array<Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tags_Order_By>>;
  where?: InputMaybe<Tags_Bool_Exp>;
};

export type Subscription_RootTags_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootTags_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Tags_Stream_Cursor_Input>>;
  where?: InputMaybe<Tags_Bool_Exp>;
};

export type Subscription_RootUser_Video_HistoryArgs = {
  distinct_on?: InputMaybe<Array<User_Video_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Video_History_Order_By>>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};

export type Subscription_RootUser_Video_History_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootUser_Video_History_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Video_History_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};

export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Subscription_RootVideo_TagsArgs = {
  distinct_on?: InputMaybe<Array<Video_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Tags_Order_By>>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};

export type Subscription_RootVideo_Tags_By_PkArgs = {
  tag_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};

export type Subscription_RootVideo_Tags_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Video_Tags_Stream_Cursor_Input>>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};

export type Subscription_RootVideo_ViewsArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

export type Subscription_RootVideo_Views_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

export type Subscription_RootVideo_Views_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootVideo_Views_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Video_Views_Stream_Cursor_Input>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

export type Subscription_RootVideosArgs = {
  distinct_on?: InputMaybe<Array<Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Videos_Order_By>>;
  where?: InputMaybe<Videos_Bool_Exp>;
};

export type Subscription_RootVideos_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_RootVideos_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Videos_Stream_Cursor_Input>>;
  where?: InputMaybe<Videos_Bool_Exp>;
};

/** Subtitles for video */
export type Subtitles = {
  __typename?: 'subtitles';
  id: Scalars['uuid']['output'];
  isDefault: Scalars['Boolean']['output'];
  lang: Scalars['String']['output'];
  url: Scalars['String']['output'];
  /** An object relationship */
  user?: Maybe<Users>;
  /** An object relationship */
  video: Videos;
};

/** order by aggregate values of table "subtitles" */
export type Subtitles_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Subtitles_Max_Order_By>;
  min?: InputMaybe<Subtitles_Min_Order_By>;
};

/** input type for inserting array relation for remote table "subtitles" */
export type Subtitles_Arr_Rel_Insert_Input = {
  data: Array<Subtitles_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Subtitles_On_Conflict>;
};

/** Boolean expression to filter rows from the table "subtitles". All fields are combined with a logical 'AND'. */
export type Subtitles_Bool_Exp = {
  _and?: InputMaybe<Array<Subtitles_Bool_Exp>>;
  _not?: InputMaybe<Subtitles_Bool_Exp>;
  _or?: InputMaybe<Array<Subtitles_Bool_Exp>>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  isDefault?: InputMaybe<Boolean_Comparison_Exp>;
  lang?: InputMaybe<String_Comparison_Exp>;
  url?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
};

/** unique or primary key constraints on table "subtitles" */
export enum Subtitles_Constraint {
  /** unique or primary key constraint on columns "id" */
  SubtitlesPkey = 'subtitles_pkey',
}

/** input type for inserting data into table "subtitles" */
export type Subtitles_Insert_Input = {
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  /** User input, not validated yet */
  urlInput?: InputMaybe<Scalars['String']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** order by max() on columns of table "subtitles" */
export type Subtitles_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  lang?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "subtitles" */
export type Subtitles_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  lang?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "subtitles" */
export type Subtitles_Mutation_Response = {
  __typename?: 'subtitles_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Subtitles>;
};

/** on_conflict condition type for table "subtitles" */
export type Subtitles_On_Conflict = {
  constraint: Subtitles_Constraint;
  update_columns?: Array<Subtitles_Update_Column>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};

/** Ordering options when selecting data from "subtitles". */
export type Subtitles_Order_By = {
  id?: InputMaybe<Order_By>;
  isDefault?: InputMaybe<Order_By>;
  lang?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  video?: InputMaybe<Videos_Order_By>;
};

/** primary key columns input for table: subtitles */
export type Subtitles_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "subtitles" */
export enum Subtitles_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  IsDefault = 'isDefault',
  /** column name */
  Lang = 'lang',
  /** column name */
  Url = 'url',
}

/** input type for updating data in table "subtitles" */
export type Subtitles_Set_Input = {
  lang?: InputMaybe<Scalars['String']['input']>;
  /** User input, not validated yet */
  urlInput?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "subtitles" */
export enum Subtitles_Update_Column {
  /** column name */
  Lang = 'lang',
  /** column name */
  UrlInput = 'urlInput',
}

export type Subtitles_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Subtitles_Set_Input>;
  /** filter the rows which have to be updated */
  where: Subtitles_Bool_Exp;
};

/** Including all tags for all sites (watch, listen, etc). Tags can have name and slug, slug + site is unique */
export type Tags = {
  __typename?: 'tags';
  /** An array relationship */
  audio_tags: Array<Audio_Tags>;
  display_order: Scalars['Int']['output'];
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  site: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  /** An array relationship */
  video_tags: Array<Video_Tags>;
};

/** Including all tags for all sites (watch, listen, etc). Tags can have name and slug, slug + site is unique */
export type TagsAudio_TagsArgs = {
  distinct_on?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audio_Tags_Order_By>>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};

/** Including all tags for all sites (watch, listen, etc). Tags can have name and slug, slug + site is unique */
export type TagsVideo_TagsArgs = {
  distinct_on?: InputMaybe<Array<Video_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Tags_Order_By>>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};

/** Boolean expression to filter rows from the table "tags". All fields are combined with a logical 'AND'. */
export type Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Tags_Bool_Exp>>;
  _not?: InputMaybe<Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Tags_Bool_Exp>>;
  audio_tags?: InputMaybe<Audio_Tags_Bool_Exp>;
  display_order?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  site?: InputMaybe<String_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  video_tags?: InputMaybe<Video_Tags_Bool_Exp>;
};

/** Ordering options when selecting data from "tags". */
export type Tags_Order_By = {
  audio_tags_aggregate?: InputMaybe<Audio_Tags_Aggregate_Order_By>;
  display_order?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  site?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  video_tags_aggregate?: InputMaybe<Video_Tags_Aggregate_Order_By>;
};

/** select columns of table "tags" */
export enum Tags_Select_Column {
  /** column name */
  DisplayOrder = 'display_order',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Site = 'site',
  /** column name */
  Slug = 'slug',
}

/** Streaming cursor of the table "tags" */
export type Tags_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tags_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tags_Stream_Cursor_Value_Input = {
  display_order?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** Pivot table between user and video, let we know how do end user interact with video */
export type User_Video_History = {
  __typename?: 'user_video_history';
  id: Scalars['uuid']['output'];
  last_watched_at: Scalars['timestamptz']['output'];
  progress_seconds: Scalars['Int']['output'];
  /** An object relationship */
  user: Users;
  /** An object relationship */
  video: Videos;
  video_id: Scalars['uuid']['output'];
};

/** order by aggregate values of table "user_video_history" */
export type User_Video_History_Aggregate_Order_By = {
  avg?: InputMaybe<User_Video_History_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Video_History_Max_Order_By>;
  min?: InputMaybe<User_Video_History_Min_Order_By>;
  stddev?: InputMaybe<User_Video_History_Stddev_Order_By>;
  stddev_pop?: InputMaybe<User_Video_History_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<User_Video_History_Stddev_Samp_Order_By>;
  sum?: InputMaybe<User_Video_History_Sum_Order_By>;
  var_pop?: InputMaybe<User_Video_History_Var_Pop_Order_By>;
  var_samp?: InputMaybe<User_Video_History_Var_Samp_Order_By>;
  variance?: InputMaybe<User_Video_History_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "user_video_history" */
export type User_Video_History_Arr_Rel_Insert_Input = {
  data: Array<User_Video_History_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Video_History_On_Conflict>;
};

/** order by avg() on columns of table "user_video_history" */
export type User_Video_History_Avg_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "user_video_history". All fields are combined with a logical 'AND'. */
export type User_Video_History_Bool_Exp = {
  _and?: InputMaybe<Array<User_Video_History_Bool_Exp>>;
  _not?: InputMaybe<User_Video_History_Bool_Exp>;
  _or?: InputMaybe<Array<User_Video_History_Bool_Exp>>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  last_watched_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  progress_seconds?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_video_history" */
export enum User_Video_History_Constraint {
  /** unique or primary key constraint on columns "id" */
  UserVideoHistoryPkey = 'user_video_history_pkey',
  /** unique or primary key constraint on columns "user_id", "video_id" */
  UserVideoHistoryUserIdVideoIdKey = 'user_video_history_user_id_video_id_key',
}

/** input type for incrementing numeric columns in table "user_video_history" */
export type User_Video_History_Inc_Input = {
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_video_history" */
export type User_Video_History_Insert_Input = {
  last_watched_at?: InputMaybe<Scalars['timestamptz']['input']>;
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** order by max() on columns of table "user_video_history" */
export type User_Video_History_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  last_watched_at?: InputMaybe<Order_By>;
  progress_seconds?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "user_video_history" */
export type User_Video_History_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  last_watched_at?: InputMaybe<Order_By>;
  progress_seconds?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user_video_history" */
export type User_Video_History_Mutation_Response = {
  __typename?: 'user_video_history_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Video_History>;
};

/** on_conflict condition type for table "user_video_history" */
export type User_Video_History_On_Conflict = {
  constraint: User_Video_History_Constraint;
  update_columns?: Array<User_Video_History_Update_Column>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};

/** Ordering options when selecting data from "user_video_history". */
export type User_Video_History_Order_By = {
  id?: InputMaybe<Order_By>;
  last_watched_at?: InputMaybe<Order_By>;
  progress_seconds?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  video?: InputMaybe<Videos_Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_video_history */
export type User_Video_History_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "user_video_history" */
export enum User_Video_History_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  LastWatchedAt = 'last_watched_at',
  /** column name */
  ProgressSeconds = 'progress_seconds',
  /** column name */
  VideoId = 'video_id',
}

/** input type for updating data in table "user_video_history" */
export type User_Video_History_Set_Input = {
  last_watched_at?: InputMaybe<Scalars['timestamptz']['input']>;
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** order by stddev() on columns of table "user_video_history" */
export type User_Video_History_Stddev_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "user_video_history" */
export type User_Video_History_Stddev_Pop_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "user_video_history" */
export type User_Video_History_Stddev_Samp_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "user_video_history" */
export type User_Video_History_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Video_History_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Video_History_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_watched_at?: InputMaybe<Scalars['timestamptz']['input']>;
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** order by sum() on columns of table "user_video_history" */
export type User_Video_History_Sum_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** update columns of table "user_video_history" */
export enum User_Video_History_Update_Column {
  /** column name */
  LastWatchedAt = 'last_watched_at',
  /** column name */
  ProgressSeconds = 'progress_seconds',
}

export type User_Video_History_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Video_History_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Video_History_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Video_History_Bool_Exp;
};

/** order by var_pop() on columns of table "user_video_history" */
export type User_Video_History_Var_Pop_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "user_video_history" */
export type User_Video_History_Var_Samp_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "user_video_history" */
export type User_Video_History_Variance_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** columns and relationships of "users" */
export type Users = {
  __typename?: 'users';
  /** An array relationship */
  audios: Array<Audios>;
  /** An array relationship */
  book_comments: Array<Book_Comments>;
  /** An array relationship */
  books: Array<Books>;
  /** An aggregate relationship */
  books_aggregate: Books_Aggregate;
  /** An array relationship */
  finance_transactions: Array<Finance_Transactions>;
  /** An aggregate relationship */
  finance_transactions_aggregate: Finance_Transactions_Aggregate;
  /** An array relationship */
  journals: Array<Journals>;
  /** An aggregate relationship */
  journals_aggregate: Journals_Aggregate;
  /** An array relationship */
  notifications: Array<Notifications>;
  /** An array relationship */
  playlists: Array<Playlist>;
  /** An array relationship */
  reading_progresses: Array<Reading_Progresses>;
  /** An aggregate relationship */
  reading_progresses_aggregate: Reading_Progresses_Aggregate;
  /** An array relationship */
  subtitles: Array<Subtitles>;
  /** An array relationship */
  user_video_histories: Array<User_Video_History>;
  username?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  video_views: Array<Video_Views>;
  /** An aggregate relationship */
  video_views_aggregate: Video_Views_Aggregate;
  /** An array relationship */
  videos: Array<Videos>;
};

/** columns and relationships of "users" */
export type UsersAudiosArgs = {
  distinct_on?: InputMaybe<Array<Audios_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audios_Order_By>>;
  where?: InputMaybe<Audios_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersBook_CommentsArgs = {
  distinct_on?: InputMaybe<Array<Book_Comments_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Book_Comments_Order_By>>;
  where?: InputMaybe<Book_Comments_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersBooksArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersBooks_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersFinance_TransactionsArgs = {
  distinct_on?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Finance_Transactions_Order_By>>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersFinance_Transactions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Finance_Transactions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Finance_Transactions_Order_By>>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersJournalsArgs = {
  distinct_on?: InputMaybe<Array<Journals_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Journals_Order_By>>;
  where?: InputMaybe<Journals_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersJournals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Journals_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Journals_Order_By>>;
  where?: InputMaybe<Journals_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersPlaylistsArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Order_By>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersReading_ProgressesArgs = {
  distinct_on?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reading_Progresses_Order_By>>;
  where?: InputMaybe<Reading_Progresses_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersReading_Progresses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reading_Progresses_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Reading_Progresses_Order_By>>;
  where?: InputMaybe<Reading_Progresses_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersSubtitlesArgs = {
  distinct_on?: InputMaybe<Array<Subtitles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Subtitles_Order_By>>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersUser_Video_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<User_Video_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Video_History_Order_By>>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersVideo_ViewsArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersVideo_Views_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersVideosArgs = {
  distinct_on?: InputMaybe<Array<Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Videos_Order_By>>;
  where?: InputMaybe<Videos_Bool_Exp>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  audios?: InputMaybe<Audios_Bool_Exp>;
  book_comments?: InputMaybe<Book_Comments_Bool_Exp>;
  books?: InputMaybe<Books_Bool_Exp>;
  books_aggregate?: InputMaybe<Books_Aggregate_Bool_Exp>;
  finance_transactions?: InputMaybe<Finance_Transactions_Bool_Exp>;
  finance_transactions_aggregate?: InputMaybe<Finance_Transactions_Aggregate_Bool_Exp>;
  journals?: InputMaybe<Journals_Bool_Exp>;
  journals_aggregate?: InputMaybe<Journals_Aggregate_Bool_Exp>;
  notifications?: InputMaybe<Notifications_Bool_Exp>;
  playlists?: InputMaybe<Playlist_Bool_Exp>;
  reading_progresses?: InputMaybe<Reading_Progresses_Bool_Exp>;
  reading_progresses_aggregate?: InputMaybe<Reading_Progresses_Aggregate_Bool_Exp>;
  subtitles?: InputMaybe<Subtitles_Bool_Exp>;
  user_video_histories?: InputMaybe<User_Video_History_Bool_Exp>;
  username?: InputMaybe<String_Comparison_Exp>;
  video_views?: InputMaybe<Video_Views_Bool_Exp>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Bool_Exp>;
  videos?: InputMaybe<Videos_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  audios_aggregate?: InputMaybe<Audios_Aggregate_Order_By>;
  book_comments_aggregate?: InputMaybe<Book_Comments_Aggregate_Order_By>;
  books_aggregate?: InputMaybe<Books_Aggregate_Order_By>;
  finance_transactions_aggregate?: InputMaybe<Finance_Transactions_Aggregate_Order_By>;
  journals_aggregate?: InputMaybe<Journals_Aggregate_Order_By>;
  notifications_aggregate?: InputMaybe<Notifications_Aggregate_Order_By>;
  playlists_aggregate?: InputMaybe<Playlist_Aggregate_Order_By>;
  reading_progresses_aggregate?: InputMaybe<Reading_Progresses_Aggregate_Order_By>;
  subtitles_aggregate?: InputMaybe<Subtitles_Aggregate_Order_By>;
  user_video_histories_aggregate?: InputMaybe<User_Video_History_Aggregate_Order_By>;
  username?: InputMaybe<Order_By>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Order_By>;
  videos_aggregate?: InputMaybe<Videos_Aggregate_Order_By>;
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  Username = 'username',
}

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  username?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

/** Junction table between videos and tags which showing many to many relationship between 2 tables */
export type Video_Tags = {
  __typename?: 'video_tags';
  /** An object relationship */
  tag: Tags;
  tag_id: Scalars['uuid']['output'];
  /** An object relationship */
  video: Videos;
  video_id: Scalars['uuid']['output'];
};

/** order by aggregate values of table "video_tags" */
export type Video_Tags_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Video_Tags_Max_Order_By>;
  min?: InputMaybe<Video_Tags_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "video_tags". All fields are combined with a logical 'AND'. */
export type Video_Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Video_Tags_Bool_Exp>>;
  _not?: InputMaybe<Video_Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Video_Tags_Bool_Exp>>;
  tag?: InputMaybe<Tags_Bool_Exp>;
  tag_id?: InputMaybe<Uuid_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** order by max() on columns of table "video_tags" */
export type Video_Tags_Max_Order_By = {
  tag_id?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "video_tags" */
export type Video_Tags_Min_Order_By = {
  tag_id?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "video_tags". */
export type Video_Tags_Order_By = {
  tag?: InputMaybe<Tags_Order_By>;
  tag_id?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** select columns of table "video_tags" */
export enum Video_Tags_Select_Column {
  /** column name */
  TagId = 'tag_id',
  /** column name */
  VideoId = 'video_id',
}

/** Streaming cursor of the table "video_tags" */
export type Video_Tags_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Video_Tags_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Video_Tags_Stream_Cursor_Value_Input = {
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** columns and relationships of "video_views" */
export type Video_Views = {
  __typename?: 'video_views';
  id: Scalars['uuid']['output'];
  /** An object relationship */
  user: Users;
  /** An object relationship */
  video: Videos;
  video_id: Scalars['uuid']['output'];
  viewed_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregated selection of "video_views" */
export type Video_Views_Aggregate = {
  __typename?: 'video_views_aggregate';
  aggregate?: Maybe<Video_Views_Aggregate_Fields>;
  nodes: Array<Video_Views>;
};

export type Video_Views_Aggregate_Bool_Exp = {
  count?: InputMaybe<Video_Views_Aggregate_Bool_Exp_Count>;
};

export type Video_Views_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Video_Views_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Video_Views_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "video_views" */
export type Video_Views_Aggregate_Fields = {
  __typename?: 'video_views_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Video_Views_Max_Fields>;
  min?: Maybe<Video_Views_Min_Fields>;
};

/** aggregate fields of "video_views" */
export type Video_Views_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Video_Views_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "video_views" */
export type Video_Views_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Video_Views_Max_Order_By>;
  min?: InputMaybe<Video_Views_Min_Order_By>;
};

/** input type for inserting array relation for remote table "video_views" */
export type Video_Views_Arr_Rel_Insert_Input = {
  data: Array<Video_Views_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Video_Views_On_Conflict>;
};

/** Boolean expression to filter rows from the table "video_views". All fields are combined with a logical 'AND'. */
export type Video_Views_Bool_Exp = {
  _and?: InputMaybe<Array<Video_Views_Bool_Exp>>;
  _not?: InputMaybe<Video_Views_Bool_Exp>;
  _or?: InputMaybe<Array<Video_Views_Bool_Exp>>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
  viewed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "video_views" */
export enum Video_Views_Constraint {
  /** unique or primary key constraint on columns "id" */
  VideoViewsPkey = 'video_views_pkey',
}

/** input type for inserting data into table "video_views" */
export type Video_Views_Insert_Input = {
  id?: InputMaybe<Scalars['uuid']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
  viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Video_Views_Max_Fields = {
  __typename?: 'video_views_max_fields';
  id?: Maybe<Scalars['uuid']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
  viewed_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "video_views" */
export type Video_Views_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
  viewed_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Video_Views_Min_Fields = {
  __typename?: 'video_views_min_fields';
  id?: Maybe<Scalars['uuid']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
  viewed_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "video_views" */
export type Video_Views_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
  viewed_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "video_views" */
export type Video_Views_Mutation_Response = {
  __typename?: 'video_views_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Video_Views>;
};

/** on_conflict condition type for table "video_views" */
export type Video_Views_On_Conflict = {
  constraint: Video_Views_Constraint;
  update_columns?: Array<Video_Views_Update_Column>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

/** Ordering options when selecting data from "video_views". */
export type Video_Views_Order_By = {
  id?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  video?: InputMaybe<Videos_Order_By>;
  video_id?: InputMaybe<Order_By>;
  viewed_at?: InputMaybe<Order_By>;
};

/** select columns of table "video_views" */
export enum Video_Views_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  VideoId = 'video_id',
  /** column name */
  ViewedAt = 'viewed_at',
}

/** Streaming cursor of the table "video_views" */
export type Video_Views_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Video_Views_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Video_Views_Stream_Cursor_Value_Input = {
  id?: InputMaybe<Scalars['uuid']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
  viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** placeholder for update columns of table "video_views" (current role has no relevant permissions) */
export enum Video_Views_Update_Column {
  /** placeholder (do not use) */
  Placeholder = '_PLACEHOLDER',
}

/** columns and relationships of "videos" */
export type Videos = {
  __typename?: 'videos';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  id: Scalars['uuid']['output'];
  /** An array relationship */
  playlist_videos: Array<Playlist_Videos>;
  /** An aggregate relationship */
  playlist_videos_aggregate: Playlist_Videos_Aggregate;
  /** short id like Youtube video id */
  sId?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  subtitles: Array<Subtitles>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  /** An object relationship */
  user: Users;
  /** An array relationship */
  user_video_histories: Array<User_Video_History>;
  /** An array relationship */
  video_tags: Array<Video_Tags>;
  /** An array relationship */
  video_views: Array<Video_Views>;
  /** An aggregate relationship */
  video_views_aggregate: Video_Views_Aggregate;
};

/** columns and relationships of "videos" */
export type VideosPlaylist_VideosArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};

/** columns and relationships of "videos" */
export type VideosPlaylist_Videos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};

/** columns and relationships of "videos" */
export type VideosSubtitlesArgs = {
  distinct_on?: InputMaybe<Array<Subtitles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Subtitles_Order_By>>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};

/** columns and relationships of "videos" */
export type VideosUser_Video_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<User_Video_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Video_History_Order_By>>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};

/** columns and relationships of "videos" */
export type VideosVideo_TagsArgs = {
  distinct_on?: InputMaybe<Array<Video_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Tags_Order_By>>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};

/** columns and relationships of "videos" */
export type VideosVideo_ViewsArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

/** columns and relationships of "videos" */
export type VideosVideo_Views_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Video_Views_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Views_Order_By>>;
  where?: InputMaybe<Video_Views_Bool_Exp>;
};

/** order by aggregate values of table "videos" */
export type Videos_Aggregate_Order_By = {
  avg?: InputMaybe<Videos_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Videos_Max_Order_By>;
  min?: InputMaybe<Videos_Min_Order_By>;
  stddev?: InputMaybe<Videos_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Videos_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Videos_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Videos_Sum_Order_By>;
  var_pop?: InputMaybe<Videos_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Videos_Var_Samp_Order_By>;
  variance?: InputMaybe<Videos_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Videos_Append_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
};

/** order by avg() on columns of table "videos" */
export type Videos_Avg_Order_By = {
  duration?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "videos". All fields are combined with a logical 'AND'. */
export type Videos_Bool_Exp = {
  _and?: InputMaybe<Array<Videos_Bool_Exp>>;
  _not?: InputMaybe<Videos_Bool_Exp>;
  _or?: InputMaybe<Array<Videos_Bool_Exp>>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  duration?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  playlist_videos?: InputMaybe<Playlist_Videos_Bool_Exp>;
  playlist_videos_aggregate?: InputMaybe<Playlist_Videos_Aggregate_Bool_Exp>;
  sId?: InputMaybe<String_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  subtitles?: InputMaybe<Subtitles_Bool_Exp>;
  thumbnailUrl?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_video_histories?: InputMaybe<User_Video_History_Bool_Exp>;
  video_tags?: InputMaybe<Video_Tags_Bool_Exp>;
  video_views?: InputMaybe<Video_Views_Bool_Exp>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "videos" */
export enum Videos_Constraint {
  /** unique or primary key constraint on columns "id" */
  VideosPkey = 'videos_pkey',
  /** unique or primary key constraint on columns "s_id" */
  VideosSIdKey = 'videos_s_id_key',
  /** unique or primary key constraint on columns "slug" */
  VideosSlugUnique = 'videos_slug_unique',
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Videos_Delete_At_Path_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Videos_Delete_Elem_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Videos_Delete_Key_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "videos" */
export type Videos_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** When this field is true, keep the source field as video_url without any video processing */
  keepOriginalSource?: InputMaybe<Scalars['Boolean']['input']>;
  playlist_videos?: InputMaybe<Playlist_Videos_Arr_Rel_Insert_Input>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  subtitles?: InputMaybe<Subtitles_Arr_Rel_Insert_Input>;
  title?: InputMaybe<Scalars['String']['input']>;
  user_video_histories?: InputMaybe<User_Video_History_Arr_Rel_Insert_Input>;
  video_url?: InputMaybe<Scalars['String']['input']>;
  video_views?: InputMaybe<Video_Views_Arr_Rel_Insert_Input>;
};

/** order by max() on columns of table "videos" */
export type Videos_Max_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  duration?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** short id like Youtube video id */
  sId?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
};

/** order by min() on columns of table "videos" */
export type Videos_Min_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  duration?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** short id like Youtube video id */
  sId?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "videos" */
export type Videos_Mutation_Response = {
  __typename?: 'videos_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Videos>;
};

/** input type for inserting object relation for remote table "videos" */
export type Videos_Obj_Rel_Insert_Input = {
  data: Videos_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Videos_On_Conflict>;
};

/** on_conflict condition type for table "videos" */
export type Videos_On_Conflict = {
  constraint: Videos_Constraint;
  update_columns?: Array<Videos_Update_Column>;
  where?: InputMaybe<Videos_Bool_Exp>;
};

/** Ordering options when selecting data from "videos". */
export type Videos_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  duration?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  playlist_videos_aggregate?: InputMaybe<Playlist_Videos_Aggregate_Order_By>;
  sId?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subtitles_aggregate?: InputMaybe<Subtitles_Aggregate_Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_video_histories_aggregate?: InputMaybe<User_Video_History_Aggregate_Order_By>;
  video_tags_aggregate?: InputMaybe<Video_Tags_Aggregate_Order_By>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Order_By>;
};

/** primary key columns input for table: videos */
export type Videos_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Videos_Prepend_Input = {
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "videos" */
export enum Videos_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Duration = 'duration',
  /** column name */
  Id = 'id',
  /** column name */
  SId = 'sId',
  /** column name */
  Slug = 'slug',
  /** column name */
  Source = 'source',
  /** column name */
  Status = 'status',
  /** column name */
  ThumbnailUrl = 'thumbnailUrl',
  /** column name */
  Title = 'title',
}

/** input type for updating data in table "videos" */
export type Videos_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  /** List of recipient emails from user input, not validated yet. End user can update this. */
  sharedRecipientsInput?: InputMaybe<Scalars['jsonb']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** order by stddev() on columns of table "videos" */
export type Videos_Stddev_Order_By = {
  duration?: InputMaybe<Order_By>;
};

/** order by stddev_pop() on columns of table "videos" */
export type Videos_Stddev_Pop_Order_By = {
  duration?: InputMaybe<Order_By>;
};

/** order by stddev_samp() on columns of table "videos" */
export type Videos_Stddev_Samp_Order_By = {
  duration?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "videos" */
export type Videos_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Videos_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Videos_Stream_Cursor_Value_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** short id like Youtube video id */
  sId?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "videos" */
export type Videos_Sum_Order_By = {
  duration?: InputMaybe<Order_By>;
};

/** update columns of table "videos" */
export enum Videos_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  SharedRecipientsInput = 'sharedRecipientsInput',
  /** column name */
  Title = 'title',
}

export type Videos_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Videos_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Videos_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Videos_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Videos_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Videos_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Videos_Set_Input>;
  /** filter the rows which have to be updated */
  where: Videos_Bool_Exp;
};

/** order by var_pop() on columns of table "videos" */
export type Videos_Var_Pop_Order_By = {
  duration?: InputMaybe<Order_By>;
};

/** order by var_samp() on columns of table "videos" */
export type Videos_Var_Samp_Order_By = {
  duration?: InputMaybe<Order_By>;
};

/** order by variance() on columns of table "videos" */
export type Videos_Variance_Order_By = {
  duration?: InputMaybe<Order_By>;
};

export type CreateDeviceRequestMutationVariables = Exact<{
  input: CreateDeviceRequestInput;
}>;

export type CreateDeviceRequestMutation = {
  __typename?: 'mutation_root';
  createDeviceRequest: {
    __typename?: 'CreateDeviceRequestResponse';
    success: boolean;
    data?: {
      __typename?: 'CreateDeviceRequestOutput';
      userCode: string;
      verificationUri: string;
    } | null;
    error?: {
      __typename?: 'DeviceRequestError';
      code: string;
      message: string;
    } | null;
  };
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>['__apiType'];
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const CreateDeviceRequestDocument = new TypedDocumentString(`
    mutation createDeviceRequest($input: CreateDeviceRequestInput!) {
  createDeviceRequest(input: $input) {
    data {
      userCode
      verificationUri
    }
    error {
      code
      message
    }
    success
  }
}
    `) as unknown as TypedDocumentString<
  CreateDeviceRequestMutation,
  CreateDeviceRequestMutationVariables
>;
