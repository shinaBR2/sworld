/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  date: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  numeric: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
  uuid: { input: any; output: any; }
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
  created_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  tag: Tags;
  tag_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "audio_tags" */
export type Audio_Tags_Aggregate = {
  __typename?: 'audio_tags_aggregate';
  aggregate?: Maybe<Audio_Tags_Aggregate_Fields>;
  nodes: Array<Audio_Tags>;
};

export type Audio_Tags_Aggregate_Bool_Exp = {
  count?: InputMaybe<Audio_Tags_Aggregate_Bool_Exp_Count>;
};

export type Audio_Tags_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Audio_Tags_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "audio_tags" */
export type Audio_Tags_Aggregate_Fields = {
  __typename?: 'audio_tags_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Audio_Tags_Max_Fields>;
  min?: Maybe<Audio_Tags_Min_Fields>;
};


/** aggregate fields of "audio_tags" */
export type Audio_Tags_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "audio_tags" */
export type Audio_Tags_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Audio_Tags_Max_Order_By>;
  min?: InputMaybe<Audio_Tags_Min_Order_By>;
};

/** input type for inserting array relation for remote table "audio_tags" */
export type Audio_Tags_Arr_Rel_Insert_Input = {
  data: Array<Audio_Tags_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Audio_Tags_On_Conflict>;
};

/** Boolean expression to filter rows from the table "audio_tags". All fields are combined with a logical 'AND'. */
export type Audio_Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Audio_Tags_Bool_Exp>>;
  _not?: InputMaybe<Audio_Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Audio_Tags_Bool_Exp>>;
  audio?: InputMaybe<Audios_Bool_Exp>;
  audio_id?: InputMaybe<Uuid_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  tag?: InputMaybe<Tags_Bool_Exp>;
  tag_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "audio_tags" */
export enum Audio_Tags_Constraint {
  /** unique or primary key constraint on columns "tag_id", "audio_id" */
  AudioTagsPkey = 'audio_tags_pkey'
}

/** input type for inserting data into table "audio_tags" */
export type Audio_Tags_Insert_Input = {
  audio?: InputMaybe<Audios_Obj_Rel_Insert_Input>;
  audio_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  tag?: InputMaybe<Tags_Obj_Rel_Insert_Input>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Audio_Tags_Max_Fields = {
  __typename?: 'audio_tags_max_fields';
  audio_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  tag_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "audio_tags" */
export type Audio_Tags_Max_Order_By = {
  audio_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Audio_Tags_Min_Fields = {
  __typename?: 'audio_tags_min_fields';
  audio_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  tag_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "audio_tags" */
export type Audio_Tags_Min_Order_By = {
  audio_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "audio_tags" */
export type Audio_Tags_Mutation_Response = {
  __typename?: 'audio_tags_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Audio_Tags>;
};

/** on_conflict condition type for table "audio_tags" */
export type Audio_Tags_On_Conflict = {
  constraint: Audio_Tags_Constraint;
  update_columns?: Array<Audio_Tags_Update_Column>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};

/** Ordering options when selecting data from "audio_tags". */
export type Audio_Tags_Order_By = {
  audio?: InputMaybe<Audios_Order_By>;
  audio_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  tag?: InputMaybe<Tags_Order_By>;
  tag_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: audio_tags */
export type Audio_Tags_Pk_Columns_Input = {
  audio_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
};

/** select columns of table "audio_tags" */
export enum Audio_Tags_Select_Column {
  /** column name */
  AudioId = 'audio_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  TagId = 'tag_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "audio_tags" */
export type Audio_Tags_Set_Input = {
  audio_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

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
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "audio_tags" */
export enum Audio_Tags_Update_Column {
  /** column name */
  AudioId = 'audio_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  TagId = 'tag_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Audio_Tags_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Audio_Tags_Set_Input>;
  /** filter the rows which have to be updated */
  where: Audio_Tags_Bool_Exp;
};

/** Audios for listen site */
export type Audios = {
  __typename?: 'audios';
  artistName: Scalars['String']['output'];
  /** An array relationship */
  audio_tags: Array<Audio_Tags>;
  /** An aggregate relationship */
  audio_tags_aggregate: Audio_Tags_Aggregate;
  createdAt: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  public: Scalars['Boolean']['output'];
  source: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
};


/** Audios for listen site */
export type AudiosAudio_TagsArgs = {
  distinct_on?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audio_Tags_Order_By>>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};


/** Audios for listen site */
export type AudiosAudio_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Audio_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audio_Tags_Order_By>>;
  where?: InputMaybe<Audio_Tags_Bool_Exp>;
};

/** aggregated selection of "audios" */
export type Audios_Aggregate = {
  __typename?: 'audios_aggregate';
  aggregate?: Maybe<Audios_Aggregate_Fields>;
  nodes: Array<Audios>;
};

export type Audios_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Audios_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Audios_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Audios_Aggregate_Bool_Exp_Count>;
};

export type Audios_Aggregate_Bool_Exp_Bool_And = {
  arguments: Audios_Select_Column_Audios_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Audios_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Audios_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Audios_Select_Column_Audios_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Audios_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Audios_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Audios_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Audios_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "audios" */
export type Audios_Aggregate_Fields = {
  __typename?: 'audios_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Audios_Max_Fields>;
  min?: Maybe<Audios_Min_Fields>;
};


/** aggregate fields of "audios" */
export type Audios_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Audios_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "audios" */
export type Audios_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Audios_Max_Order_By>;
  min?: InputMaybe<Audios_Min_Order_By>;
};

/** input type for inserting array relation for remote table "audios" */
export type Audios_Arr_Rel_Insert_Input = {
  data: Array<Audios_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Audios_On_Conflict>;
};

/** Boolean expression to filter rows from the table "audios". All fields are combined with a logical 'AND'. */
export type Audios_Bool_Exp = {
  _and?: InputMaybe<Array<Audios_Bool_Exp>>;
  _not?: InputMaybe<Audios_Bool_Exp>;
  _or?: InputMaybe<Array<Audios_Bool_Exp>>;
  artistName?: InputMaybe<String_Comparison_Exp>;
  audio_tags?: InputMaybe<Audio_Tags_Bool_Exp>;
  audio_tags_aggregate?: InputMaybe<Audio_Tags_Aggregate_Bool_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  public?: InputMaybe<Boolean_Comparison_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  thumbnailUrl?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "audios" */
export enum Audios_Constraint {
  /** unique or primary key constraint on columns "id" */
  AudiosPkey = 'audios_pkey'
}

/** input type for inserting data into table "audios" */
export type Audios_Insert_Input = {
  artistName?: InputMaybe<Scalars['String']['input']>;
  audio_tags?: InputMaybe<Audio_Tags_Arr_Rel_Insert_Input>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Audios_Max_Fields = {
  __typename?: 'audios_max_fields';
  artistName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Audios_Min_Fields = {
  __typename?: 'audios_min_fields';
  artistName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "audios" */
export type Audios_Mutation_Response = {
  __typename?: 'audios_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Audios>;
};

/** input type for inserting object relation for remote table "audios" */
export type Audios_Obj_Rel_Insert_Input = {
  data: Audios_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Audios_On_Conflict>;
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
  user_id?: InputMaybe<Order_By>;
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
  /** column name */
  UserId = 'user_id'
}

/** select "audios_aggregate_bool_exp_bool_and_arguments_columns" columns of table "audios" */
export enum Audios_Select_Column_Audios_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Public = 'public'
}

/** select "audios_aggregate_bool_exp_bool_or_arguments_columns" columns of table "audios" */
export enum Audios_Select_Column_Audios_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Public = 'public'
}

/** input type for updating data in table "audios" */
export type Audios_Set_Input = {
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
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "audios" */
export enum Audios_Update_Column {
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
  /** column name */
  UserId = 'user_id'
}

export type Audios_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Audios_Set_Input>;
  /** filter the rows which have to be updated */
  where: Audios_Bool_Exp;
};

/** Requests to crawl content from any sources */
export type Crawl_Requests = {
  __typename?: 'crawl_requests';
  created_at: Scalars['timestamptz']['output'];
  get_single_video?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['uuid']['output'];
  site: Scalars['String']['output'];
  slug_prefix?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  url: Scalars['String']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
};

/** aggregated selection of "crawl_requests" */
export type Crawl_Requests_Aggregate = {
  __typename?: 'crawl_requests_aggregate';
  aggregate?: Maybe<Crawl_Requests_Aggregate_Fields>;
  nodes: Array<Crawl_Requests>;
};

export type Crawl_Requests_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Crawl_Requests_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Crawl_Requests_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Crawl_Requests_Aggregate_Bool_Exp_Count>;
};

export type Crawl_Requests_Aggregate_Bool_Exp_Bool_And = {
  arguments: Crawl_Requests_Select_Column_Crawl_Requests_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Crawl_Requests_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Crawl_Requests_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Crawl_Requests_Select_Column_Crawl_Requests_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Crawl_Requests_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Crawl_Requests_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Crawl_Requests_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "crawl_requests" */
export type Crawl_Requests_Aggregate_Fields = {
  __typename?: 'crawl_requests_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Crawl_Requests_Max_Fields>;
  min?: Maybe<Crawl_Requests_Min_Fields>;
};


/** aggregate fields of "crawl_requests" */
export type Crawl_Requests_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "crawl_requests" */
export type Crawl_Requests_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Crawl_Requests_Max_Order_By>;
  min?: InputMaybe<Crawl_Requests_Min_Order_By>;
};

/** input type for inserting array relation for remote table "crawl_requests" */
export type Crawl_Requests_Arr_Rel_Insert_Input = {
  data: Array<Crawl_Requests_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Crawl_Requests_On_Conflict>;
};

/** Boolean expression to filter rows from the table "crawl_requests". All fields are combined with a logical 'AND'. */
export type Crawl_Requests_Bool_Exp = {
  _and?: InputMaybe<Array<Crawl_Requests_Bool_Exp>>;
  _not?: InputMaybe<Crawl_Requests_Bool_Exp>;
  _or?: InputMaybe<Array<Crawl_Requests_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  get_single_video?: InputMaybe<Boolean_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  site?: InputMaybe<String_Comparison_Exp>;
  slug_prefix?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  url?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "crawl_requests" */
export enum Crawl_Requests_Constraint {
  /** unique or primary key constraint on columns "id" */
  CrawlRequestsPkey = 'crawl_requests_pkey'
}

/** input type for inserting data into table "crawl_requests" */
export type Crawl_Requests_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  get_single_video?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug_prefix?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Crawl_Requests_Max_Fields = {
  __typename?: 'crawl_requests_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  site?: Maybe<Scalars['String']['output']>;
  slug_prefix?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "crawl_requests" */
export type Crawl_Requests_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  site?: InputMaybe<Order_By>;
  slug_prefix?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Crawl_Requests_Min_Fields = {
  __typename?: 'crawl_requests_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  site?: Maybe<Scalars['String']['output']>;
  slug_prefix?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "crawl_requests" */
export type Crawl_Requests_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  site?: InputMaybe<Order_By>;
  slug_prefix?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "crawl_requests" */
export type Crawl_Requests_Mutation_Response = {
  __typename?: 'crawl_requests_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Crawl_Requests>;
};

/** on_conflict condition type for table "crawl_requests" */
export type Crawl_Requests_On_Conflict = {
  constraint: Crawl_Requests_Constraint;
  update_columns?: Array<Crawl_Requests_Update_Column>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};

/** Ordering options when selecting data from "crawl_requests". */
export type Crawl_Requests_Order_By = {
  created_at?: InputMaybe<Order_By>;
  get_single_video?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  site?: InputMaybe<Order_By>;
  slug_prefix?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: crawl_requests */
export type Crawl_Requests_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "crawl_requests" */
export enum Crawl_Requests_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  GetSingleVideo = 'get_single_video',
  /** column name */
  Id = 'id',
  /** column name */
  Site = 'site',
  /** column name */
  SlugPrefix = 'slug_prefix',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Url = 'url',
  /** column name */
  UserId = 'user_id'
}

/** select "crawl_requests_aggregate_bool_exp_bool_and_arguments_columns" columns of table "crawl_requests" */
export enum Crawl_Requests_Select_Column_Crawl_Requests_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  GetSingleVideo = 'get_single_video'
}

/** select "crawl_requests_aggregate_bool_exp_bool_or_arguments_columns" columns of table "crawl_requests" */
export enum Crawl_Requests_Select_Column_Crawl_Requests_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  GetSingleVideo = 'get_single_video'
}

/** input type for updating data in table "crawl_requests" */
export type Crawl_Requests_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  get_single_video?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug_prefix?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "crawl_requests" */
export type Crawl_Requests_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Crawl_Requests_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Crawl_Requests_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  get_single_video?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug_prefix?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "crawl_requests" */
export enum Crawl_Requests_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  GetSingleVideo = 'get_single_video',
  /** column name */
  Id = 'id',
  /** column name */
  Site = 'site',
  /** column name */
  SlugPrefix = 'slug_prefix',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Url = 'url',
  /** column name */
  UserId = 'user_id'
}

export type Crawl_Requests_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Crawl_Requests_Set_Input>;
  /** filter the rows which have to be updated */
  where: Crawl_Requests_Bool_Exp;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
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
  created_at: Scalars['timestamptz']['output'];
  description: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  require_auth: Scalars['Boolean']['output'];
  site: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};


/** Feature flag system and we must leverage Hasura subscription to watch this */
export type Feature_FlagConditionsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "feature_flag" */
export type Feature_Flag_Aggregate = {
  __typename?: 'feature_flag_aggregate';
  aggregate?: Maybe<Feature_Flag_Aggregate_Fields>;
  nodes: Array<Feature_Flag>;
};

/** aggregate fields of "feature_flag" */
export type Feature_Flag_Aggregate_Fields = {
  __typename?: 'feature_flag_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Feature_Flag_Max_Fields>;
  min?: Maybe<Feature_Flag_Min_Fields>;
};


/** aggregate fields of "feature_flag" */
export type Feature_Flag_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Feature_Flag_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Feature_Flag_Append_Input = {
  conditions?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "feature_flag". All fields are combined with a logical 'AND'. */
export type Feature_Flag_Bool_Exp = {
  _and?: InputMaybe<Array<Feature_Flag_Bool_Exp>>;
  _not?: InputMaybe<Feature_Flag_Bool_Exp>;
  _or?: InputMaybe<Array<Feature_Flag_Bool_Exp>>;
  conditions?: InputMaybe<Jsonb_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  require_auth?: InputMaybe<Boolean_Comparison_Exp>;
  site?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "feature_flag" */
export enum Feature_Flag_Constraint {
  /** unique or primary key constraint on columns "id" */
  FeatureFlagPkey = 'feature_flag_pkey',
  /** unique or primary key constraint on columns "name", "site" */
  FeatureFlagSiteNameKey = 'feature_flag_site_name_key'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Feature_Flag_Delete_At_Path_Input = {
  conditions?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Feature_Flag_Delete_Elem_Input = {
  conditions?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Feature_Flag_Delete_Key_Input = {
  conditions?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "feature_flag" */
export type Feature_Flag_Insert_Input = {
  conditions?: InputMaybe<Scalars['jsonb']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  require_auth?: InputMaybe<Scalars['Boolean']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Feature_Flag_Max_Fields = {
  __typename?: 'feature_flag_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  site?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Feature_Flag_Min_Fields = {
  __typename?: 'feature_flag_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  site?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "feature_flag" */
export type Feature_Flag_Mutation_Response = {
  __typename?: 'feature_flag_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Feature_Flag>;
};

/** on_conflict condition type for table "feature_flag" */
export type Feature_Flag_On_Conflict = {
  constraint: Feature_Flag_Constraint;
  update_columns?: Array<Feature_Flag_Update_Column>;
  where?: InputMaybe<Feature_Flag_Bool_Exp>;
};

/** Ordering options when selecting data from "feature_flag". */
export type Feature_Flag_Order_By = {
  conditions?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  require_auth?: InputMaybe<Order_By>;
  site?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: feature_flag */
export type Feature_Flag_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Feature_Flag_Prepend_Input = {
  conditions?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "feature_flag" */
export enum Feature_Flag_Select_Column {
  /** column name */
  Conditions = 'conditions',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  RequireAuth = 'require_auth',
  /** column name */
  Site = 'site',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "feature_flag" */
export type Feature_Flag_Set_Input = {
  conditions?: InputMaybe<Scalars['jsonb']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  require_auth?: InputMaybe<Scalars['Boolean']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

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
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  require_auth?: InputMaybe<Scalars['Boolean']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "feature_flag" */
export enum Feature_Flag_Update_Column {
  /** column name */
  Conditions = 'conditions',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  RequireAuth = 'require_auth',
  /** column name */
  Site = 'site',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Feature_Flag_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Feature_Flag_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Feature_Flag_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Feature_Flag_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Feature_Flag_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Feature_Flag_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Feature_Flag_Set_Input>;
  /** filter the rows which have to be updated */
  where: Feature_Flag_Bool_Exp;
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
  user_id: Scalars['uuid']['output'];
  year: Scalars['Int']['output'];
};

/** aggregated selection of "finance_transactions" */
export type Finance_Transactions_Aggregate = {
  __typename?: 'finance_transactions_aggregate';
  aggregate?: Maybe<Finance_Transactions_Aggregate_Fields>;
  nodes: Array<Finance_Transactions>;
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

/** aggregate avg on columns */
export type Finance_Transactions_Avg_Fields = {
  __typename?: 'finance_transactions_avg_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
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
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  year?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "finance_transactions" */
export enum Finance_Transactions_Constraint {
  /** unique or primary key constraint on columns "id" */
  FinanceTransactionsPkey = 'finance_transactions_pkey'
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
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
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
  Year = 'year'
}

/** input type for updating data in table "finance_transactions" */
export type Finance_Transactions_Set_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  /** Should be either must, nice or waste */
  category?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Finance_Transactions_Stddev_Fields = {
  __typename?: 'finance_transactions_stddev_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Finance_Transactions_Stddev_Pop_Fields = {
  __typename?: 'finance_transactions_stddev_pop_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Finance_Transactions_Stddev_Samp_Fields = {
  __typename?: 'finance_transactions_stddev_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "finance_transactions" */
export type Finance_Transactions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Finance_Transactions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Finance_Transactions_Stream_Cursor_Value_Input = {
  amount?: InputMaybe<Scalars['numeric']['input']>;
  /** Should be either must, nice or waste */
  category?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Finance_Transactions_Sum_Fields = {
  __typename?: 'finance_transactions_sum_fields';
  amount?: Maybe<Scalars['numeric']['output']>;
  month?: Maybe<Scalars['Int']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "finance_transactions" */
export enum Finance_Transactions_Update_Column {
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
  Year = 'year'
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

/** aggregate var_samp on columns */
export type Finance_Transactions_Var_Samp_Fields = {
  __typename?: 'finance_transactions_var_samp_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Finance_Transactions_Variance_Fields = {
  __typename?: 'finance_transactions_variance_fields';
  amount?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Float']['output']>;
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
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "journals" */
export enum Journals_Constraint {
  /** unique or primary key constraint on columns "id" */
  JournalsPkey = 'journals_pkey'
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
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mood?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['jsonb']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
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
  UserId = 'user_id'
}

/** input type for updating data in table "journals" */
export type Journals_Set_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mood?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['jsonb']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "journals" */
export type Journals_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Journals_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Journals_Stream_Cursor_Value_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  date?: InputMaybe<Scalars['date']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  mood?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['jsonb']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "journals" */
export enum Journals_Update_Column {
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
  UserId = 'user_id'
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
  /** delete data from the table: "audio_tags" */
  delete_audio_tags?: Maybe<Audio_Tags_Mutation_Response>;
  /** delete single row from the table: "audio_tags" */
  delete_audio_tags_by_pk?: Maybe<Audio_Tags>;
  /** delete data from the table: "audios" */
  delete_audios?: Maybe<Audios_Mutation_Response>;
  /** delete single row from the table: "audios" */
  delete_audios_by_pk?: Maybe<Audios>;
  /** delete data from the table: "crawl_requests" */
  delete_crawl_requests?: Maybe<Crawl_Requests_Mutation_Response>;
  /** delete single row from the table: "crawl_requests" */
  delete_crawl_requests_by_pk?: Maybe<Crawl_Requests>;
  /** delete data from the table: "feature_flag" */
  delete_feature_flag?: Maybe<Feature_Flag_Mutation_Response>;
  /** delete single row from the table: "feature_flag" */
  delete_feature_flag_by_pk?: Maybe<Feature_Flag>;
  /** delete data from the table: "finance_transactions" */
  delete_finance_transactions?: Maybe<Finance_Transactions_Mutation_Response>;
  /** delete single row from the table: "finance_transactions" */
  delete_finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** delete data from the table: "journals" */
  delete_journals?: Maybe<Journals_Mutation_Response>;
  /** delete single row from the table: "journals" */
  delete_journals_by_pk?: Maybe<Journals>;
  /** delete data from the table: "notifications" */
  delete_notifications?: Maybe<Notifications_Mutation_Response>;
  /** delete single row from the table: "notifications" */
  delete_notifications_by_pk?: Maybe<Notifications>;
  /** delete data from the table: "playlist" */
  delete_playlist?: Maybe<Playlist_Mutation_Response>;
  /** delete single row from the table: "playlist" */
  delete_playlist_by_pk?: Maybe<Playlist>;
  /** delete data from the table: "playlist_videos" */
  delete_playlist_videos?: Maybe<Playlist_Videos_Mutation_Response>;
  /** delete single row from the table: "playlist_videos" */
  delete_playlist_videos_by_pk?: Maybe<Playlist_Videos>;
  /** delete data from the table: "posts" */
  delete_posts?: Maybe<Posts_Mutation_Response>;
  /** delete single row from the table: "posts" */
  delete_posts_by_pk?: Maybe<Posts>;
  /** delete data from the table: "subtitles" */
  delete_subtitles?: Maybe<Subtitles_Mutation_Response>;
  /** delete single row from the table: "subtitles" */
  delete_subtitles_by_pk?: Maybe<Subtitles>;
  /** delete data from the table: "tags" */
  delete_tags?: Maybe<Tags_Mutation_Response>;
  /** delete single row from the table: "tags" */
  delete_tags_by_pk?: Maybe<Tags>;
  /** delete data from the table: "tasks" */
  delete_tasks?: Maybe<Tasks_Mutation_Response>;
  /** delete single row from the table: "tasks" */
  delete_tasks_by_pk?: Maybe<Tasks>;
  /** delete data from the table: "test" */
  delete_test?: Maybe<Test_Mutation_Response>;
  /** delete single row from the table: "test" */
  delete_test_by_pk?: Maybe<Test>;
  /** delete data from the table: "user_video_history" */
  delete_user_video_history?: Maybe<User_Video_History_Mutation_Response>;
  /** delete single row from the table: "user_video_history" */
  delete_user_video_history_by_pk?: Maybe<User_Video_History>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** delete data from the table: "video_tags" */
  delete_video_tags?: Maybe<Video_Tags_Mutation_Response>;
  /** delete single row from the table: "video_tags" */
  delete_video_tags_by_pk?: Maybe<Video_Tags>;
  /** delete data from the table: "video_views" */
  delete_video_views?: Maybe<Video_Views_Mutation_Response>;
  /** delete single row from the table: "video_views" */
  delete_video_views_by_pk?: Maybe<Video_Views>;
  /** delete data from the table: "videos" */
  delete_videos?: Maybe<Videos_Mutation_Response>;
  /** delete single row from the table: "videos" */
  delete_videos_by_pk?: Maybe<Videos>;
  /** insert data into the table: "audio_tags" */
  insert_audio_tags?: Maybe<Audio_Tags_Mutation_Response>;
  /** insert a single row into the table: "audio_tags" */
  insert_audio_tags_one?: Maybe<Audio_Tags>;
  /** insert data into the table: "audios" */
  insert_audios?: Maybe<Audios_Mutation_Response>;
  /** insert a single row into the table: "audios" */
  insert_audios_one?: Maybe<Audios>;
  /** insert data into the table: "crawl_requests" */
  insert_crawl_requests?: Maybe<Crawl_Requests_Mutation_Response>;
  /** insert a single row into the table: "crawl_requests" */
  insert_crawl_requests_one?: Maybe<Crawl_Requests>;
  /** insert data into the table: "feature_flag" */
  insert_feature_flag?: Maybe<Feature_Flag_Mutation_Response>;
  /** insert a single row into the table: "feature_flag" */
  insert_feature_flag_one?: Maybe<Feature_Flag>;
  /** insert data into the table: "finance_transactions" */
  insert_finance_transactions?: Maybe<Finance_Transactions_Mutation_Response>;
  /** insert a single row into the table: "finance_transactions" */
  insert_finance_transactions_one?: Maybe<Finance_Transactions>;
  /** insert data into the table: "journals" */
  insert_journals?: Maybe<Journals_Mutation_Response>;
  /** insert a single row into the table: "journals" */
  insert_journals_one?: Maybe<Journals>;
  /** insert data into the table: "notifications" */
  insert_notifications?: Maybe<Notifications_Mutation_Response>;
  /** insert a single row into the table: "notifications" */
  insert_notifications_one?: Maybe<Notifications>;
  /** insert data into the table: "playlist" */
  insert_playlist?: Maybe<Playlist_Mutation_Response>;
  /** insert a single row into the table: "playlist" */
  insert_playlist_one?: Maybe<Playlist>;
  /** insert data into the table: "playlist_videos" */
  insert_playlist_videos?: Maybe<Playlist_Videos_Mutation_Response>;
  /** insert a single row into the table: "playlist_videos" */
  insert_playlist_videos_one?: Maybe<Playlist_Videos>;
  /** insert data into the table: "posts" */
  insert_posts?: Maybe<Posts_Mutation_Response>;
  /** insert a single row into the table: "posts" */
  insert_posts_one?: Maybe<Posts>;
  /** insert data into the table: "subtitles" */
  insert_subtitles?: Maybe<Subtitles_Mutation_Response>;
  /** insert a single row into the table: "subtitles" */
  insert_subtitles_one?: Maybe<Subtitles>;
  /** insert data into the table: "tags" */
  insert_tags?: Maybe<Tags_Mutation_Response>;
  /** insert a single row into the table: "tags" */
  insert_tags_one?: Maybe<Tags>;
  /** insert data into the table: "tasks" */
  insert_tasks?: Maybe<Tasks_Mutation_Response>;
  /** insert a single row into the table: "tasks" */
  insert_tasks_one?: Maybe<Tasks>;
  /** insert data into the table: "test" */
  insert_test?: Maybe<Test_Mutation_Response>;
  /** insert a single row into the table: "test" */
  insert_test_one?: Maybe<Test>;
  /** insert data into the table: "user_video_history" */
  insert_user_video_history?: Maybe<User_Video_History_Mutation_Response>;
  /** insert a single row into the table: "user_video_history" */
  insert_user_video_history_one?: Maybe<User_Video_History>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** insert data into the table: "video_tags" */
  insert_video_tags?: Maybe<Video_Tags_Mutation_Response>;
  /** insert a single row into the table: "video_tags" */
  insert_video_tags_one?: Maybe<Video_Tags>;
  /** insert data into the table: "video_views" */
  insert_video_views?: Maybe<Video_Views_Mutation_Response>;
  /** insert a single row into the table: "video_views" */
  insert_video_views_one?: Maybe<Video_Views>;
  /** insert data into the table: "videos" */
  insert_videos?: Maybe<Videos_Mutation_Response>;
  /** insert a single row into the table: "videos" */
  insert_videos_one?: Maybe<Videos>;
  /** update data of the table: "audio_tags" */
  update_audio_tags?: Maybe<Audio_Tags_Mutation_Response>;
  /** update single row of the table: "audio_tags" */
  update_audio_tags_by_pk?: Maybe<Audio_Tags>;
  /** update multiples rows of table: "audio_tags" */
  update_audio_tags_many?: Maybe<Array<Maybe<Audio_Tags_Mutation_Response>>>;
  /** update data of the table: "audios" */
  update_audios?: Maybe<Audios_Mutation_Response>;
  /** update single row of the table: "audios" */
  update_audios_by_pk?: Maybe<Audios>;
  /** update multiples rows of table: "audios" */
  update_audios_many?: Maybe<Array<Maybe<Audios_Mutation_Response>>>;
  /** update data of the table: "crawl_requests" */
  update_crawl_requests?: Maybe<Crawl_Requests_Mutation_Response>;
  /** update single row of the table: "crawl_requests" */
  update_crawl_requests_by_pk?: Maybe<Crawl_Requests>;
  /** update multiples rows of table: "crawl_requests" */
  update_crawl_requests_many?: Maybe<Array<Maybe<Crawl_Requests_Mutation_Response>>>;
  /** update data of the table: "feature_flag" */
  update_feature_flag?: Maybe<Feature_Flag_Mutation_Response>;
  /** update single row of the table: "feature_flag" */
  update_feature_flag_by_pk?: Maybe<Feature_Flag>;
  /** update multiples rows of table: "feature_flag" */
  update_feature_flag_many?: Maybe<Array<Maybe<Feature_Flag_Mutation_Response>>>;
  /** update data of the table: "finance_transactions" */
  update_finance_transactions?: Maybe<Finance_Transactions_Mutation_Response>;
  /** update single row of the table: "finance_transactions" */
  update_finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** update multiples rows of table: "finance_transactions" */
  update_finance_transactions_many?: Maybe<Array<Maybe<Finance_Transactions_Mutation_Response>>>;
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
  update_notifications_many?: Maybe<Array<Maybe<Notifications_Mutation_Response>>>;
  /** update data of the table: "playlist" */
  update_playlist?: Maybe<Playlist_Mutation_Response>;
  /** update single row of the table: "playlist" */
  update_playlist_by_pk?: Maybe<Playlist>;
  /** update multiples rows of table: "playlist" */
  update_playlist_many?: Maybe<Array<Maybe<Playlist_Mutation_Response>>>;
  /** update data of the table: "playlist_videos" */
  update_playlist_videos?: Maybe<Playlist_Videos_Mutation_Response>;
  /** update single row of the table: "playlist_videos" */
  update_playlist_videos_by_pk?: Maybe<Playlist_Videos>;
  /** update multiples rows of table: "playlist_videos" */
  update_playlist_videos_many?: Maybe<Array<Maybe<Playlist_Videos_Mutation_Response>>>;
  /** update data of the table: "posts" */
  update_posts?: Maybe<Posts_Mutation_Response>;
  /** update single row of the table: "posts" */
  update_posts_by_pk?: Maybe<Posts>;
  /** update multiples rows of table: "posts" */
  update_posts_many?: Maybe<Array<Maybe<Posts_Mutation_Response>>>;
  /** update data of the table: "subtitles" */
  update_subtitles?: Maybe<Subtitles_Mutation_Response>;
  /** update single row of the table: "subtitles" */
  update_subtitles_by_pk?: Maybe<Subtitles>;
  /** update multiples rows of table: "subtitles" */
  update_subtitles_many?: Maybe<Array<Maybe<Subtitles_Mutation_Response>>>;
  /** update data of the table: "tags" */
  update_tags?: Maybe<Tags_Mutation_Response>;
  /** update single row of the table: "tags" */
  update_tags_by_pk?: Maybe<Tags>;
  /** update multiples rows of table: "tags" */
  update_tags_many?: Maybe<Array<Maybe<Tags_Mutation_Response>>>;
  /** update data of the table: "tasks" */
  update_tasks?: Maybe<Tasks_Mutation_Response>;
  /** update single row of the table: "tasks" */
  update_tasks_by_pk?: Maybe<Tasks>;
  /** update multiples rows of table: "tasks" */
  update_tasks_many?: Maybe<Array<Maybe<Tasks_Mutation_Response>>>;
  /** update data of the table: "test" */
  update_test?: Maybe<Test_Mutation_Response>;
  /** update single row of the table: "test" */
  update_test_by_pk?: Maybe<Test>;
  /** update multiples rows of table: "test" */
  update_test_many?: Maybe<Array<Maybe<Test_Mutation_Response>>>;
  /** update data of the table: "user_video_history" */
  update_user_video_history?: Maybe<User_Video_History_Mutation_Response>;
  /** update single row of the table: "user_video_history" */
  update_user_video_history_by_pk?: Maybe<User_Video_History>;
  /** update multiples rows of table: "user_video_history" */
  update_user_video_history_many?: Maybe<Array<Maybe<User_Video_History_Mutation_Response>>>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "users" */
  update_users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
  /** update data of the table: "video_tags" */
  update_video_tags?: Maybe<Video_Tags_Mutation_Response>;
  /** update single row of the table: "video_tags" */
  update_video_tags_by_pk?: Maybe<Video_Tags>;
  /** update multiples rows of table: "video_tags" */
  update_video_tags_many?: Maybe<Array<Maybe<Video_Tags_Mutation_Response>>>;
  /** update data of the table: "video_views" */
  update_video_views?: Maybe<Video_Views_Mutation_Response>;
  /** update single row of the table: "video_views" */
  update_video_views_by_pk?: Maybe<Video_Views>;
  /** update multiples rows of table: "video_views" */
  update_video_views_many?: Maybe<Array<Maybe<Video_Views_Mutation_Response>>>;
  /** update data of the table: "videos" */
  update_videos?: Maybe<Videos_Mutation_Response>;
  /** update single row of the table: "videos" */
  update_videos_by_pk?: Maybe<Videos>;
  /** update multiples rows of table: "videos" */
  update_videos_many?: Maybe<Array<Maybe<Videos_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_Audio_TagsArgs = {
  where: Audio_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Audio_Tags_By_PkArgs = {
  audio_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
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
export type Mutation_RootDelete_Crawl_RequestsArgs = {
  where: Crawl_Requests_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Crawl_Requests_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Feature_FlagArgs = {
  where: Feature_Flag_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Feature_Flag_By_PkArgs = {
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
export type Mutation_RootDelete_NotificationsArgs = {
  where: Notifications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Notifications_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PlaylistArgs = {
  where: Playlist_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Playlist_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Playlist_VideosArgs = {
  where: Playlist_Videos_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Playlist_Videos_By_PkArgs = {
  playlist_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PostsArgs = {
  where: Posts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Posts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_SubtitlesArgs = {
  where: Subtitles_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Subtitles_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_TagsArgs = {
  where: Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Tags_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_TasksArgs = {
  where: Tasks_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Tasks_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_TestArgs = {
  where: Test_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Test_By_PkArgs = {
  id: Scalars['Int']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_Video_HistoryArgs = {
  where: User_Video_History_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Video_History_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Video_TagsArgs = {
  where: Video_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Video_Tags_By_PkArgs = {
  tag_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Video_ViewsArgs = {
  where: Video_Views_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Video_Views_By_PkArgs = {
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
export type Mutation_RootInsert_Audio_TagsArgs = {
  objects: Array<Audio_Tags_Insert_Input>;
  on_conflict?: InputMaybe<Audio_Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Audio_Tags_OneArgs = {
  object: Audio_Tags_Insert_Input;
  on_conflict?: InputMaybe<Audio_Tags_On_Conflict>;
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
export type Mutation_RootInsert_Crawl_RequestsArgs = {
  objects: Array<Crawl_Requests_Insert_Input>;
  on_conflict?: InputMaybe<Crawl_Requests_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Crawl_Requests_OneArgs = {
  object: Crawl_Requests_Insert_Input;
  on_conflict?: InputMaybe<Crawl_Requests_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Feature_FlagArgs = {
  objects: Array<Feature_Flag_Insert_Input>;
  on_conflict?: InputMaybe<Feature_Flag_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Feature_Flag_OneArgs = {
  object: Feature_Flag_Insert_Input;
  on_conflict?: InputMaybe<Feature_Flag_On_Conflict>;
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
export type Mutation_RootInsert_NotificationsArgs = {
  objects: Array<Notifications_Insert_Input>;
  on_conflict?: InputMaybe<Notifications_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Notifications_OneArgs = {
  object: Notifications_Insert_Input;
  on_conflict?: InputMaybe<Notifications_On_Conflict>;
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
export type Mutation_RootInsert_PostsArgs = {
  objects: Array<Posts_Insert_Input>;
  on_conflict?: InputMaybe<Posts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Posts_OneArgs = {
  object: Posts_Insert_Input;
  on_conflict?: InputMaybe<Posts_On_Conflict>;
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
export type Mutation_RootInsert_TagsArgs = {
  objects: Array<Tags_Insert_Input>;
  on_conflict?: InputMaybe<Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Tags_OneArgs = {
  object: Tags_Insert_Input;
  on_conflict?: InputMaybe<Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_TasksArgs = {
  objects: Array<Tasks_Insert_Input>;
  on_conflict?: InputMaybe<Tasks_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Tasks_OneArgs = {
  object: Tasks_Insert_Input;
  on_conflict?: InputMaybe<Tasks_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_TestArgs = {
  objects: Array<Test_Insert_Input>;
  on_conflict?: InputMaybe<Test_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Test_OneArgs = {
  object: Test_Insert_Input;
  on_conflict?: InputMaybe<Test_On_Conflict>;
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
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Video_TagsArgs = {
  objects: Array<Video_Tags_Insert_Input>;
  on_conflict?: InputMaybe<Video_Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Video_Tags_OneArgs = {
  object: Video_Tags_Insert_Input;
  on_conflict?: InputMaybe<Video_Tags_On_Conflict>;
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
export type Mutation_RootUpdate_Audio_TagsArgs = {
  _set?: InputMaybe<Audio_Tags_Set_Input>;
  where: Audio_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Audio_Tags_By_PkArgs = {
  _set?: InputMaybe<Audio_Tags_Set_Input>;
  pk_columns: Audio_Tags_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Audio_Tags_ManyArgs = {
  updates: Array<Audio_Tags_Updates>;
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
export type Mutation_RootUpdate_Crawl_RequestsArgs = {
  _set?: InputMaybe<Crawl_Requests_Set_Input>;
  where: Crawl_Requests_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Crawl_Requests_By_PkArgs = {
  _set?: InputMaybe<Crawl_Requests_Set_Input>;
  pk_columns: Crawl_Requests_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Crawl_Requests_ManyArgs = {
  updates: Array<Crawl_Requests_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Feature_FlagArgs = {
  _append?: InputMaybe<Feature_Flag_Append_Input>;
  _delete_at_path?: InputMaybe<Feature_Flag_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Feature_Flag_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Feature_Flag_Delete_Key_Input>;
  _prepend?: InputMaybe<Feature_Flag_Prepend_Input>;
  _set?: InputMaybe<Feature_Flag_Set_Input>;
  where: Feature_Flag_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Feature_Flag_By_PkArgs = {
  _append?: InputMaybe<Feature_Flag_Append_Input>;
  _delete_at_path?: InputMaybe<Feature_Flag_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Feature_Flag_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Feature_Flag_Delete_Key_Input>;
  _prepend?: InputMaybe<Feature_Flag_Prepend_Input>;
  _set?: InputMaybe<Feature_Flag_Set_Input>;
  pk_columns: Feature_Flag_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Feature_Flag_ManyArgs = {
  updates: Array<Feature_Flag_Updates>;
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
  _append?: InputMaybe<Notifications_Append_Input>;
  _delete_at_path?: InputMaybe<Notifications_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Notifications_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Notifications_Delete_Key_Input>;
  _prepend?: InputMaybe<Notifications_Prepend_Input>;
  _set?: InputMaybe<Notifications_Set_Input>;
  where: Notifications_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Notifications_By_PkArgs = {
  _append?: InputMaybe<Notifications_Append_Input>;
  _delete_at_path?: InputMaybe<Notifications_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Notifications_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Notifications_Delete_Key_Input>;
  _prepend?: InputMaybe<Notifications_Prepend_Input>;
  _set?: InputMaybe<Notifications_Set_Input>;
  pk_columns: Notifications_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Notifications_ManyArgs = {
  updates: Array<Notifications_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_PlaylistArgs = {
  _set?: InputMaybe<Playlist_Set_Input>;
  where: Playlist_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Playlist_By_PkArgs = {
  _set?: InputMaybe<Playlist_Set_Input>;
  pk_columns: Playlist_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Playlist_ManyArgs = {
  updates: Array<Playlist_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Playlist_VideosArgs = {
  _inc?: InputMaybe<Playlist_Videos_Inc_Input>;
  _set?: InputMaybe<Playlist_Videos_Set_Input>;
  where: Playlist_Videos_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Playlist_Videos_By_PkArgs = {
  _inc?: InputMaybe<Playlist_Videos_Inc_Input>;
  _set?: InputMaybe<Playlist_Videos_Set_Input>;
  pk_columns: Playlist_Videos_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Playlist_Videos_ManyArgs = {
  updates: Array<Playlist_Videos_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_PostsArgs = {
  _inc?: InputMaybe<Posts_Inc_Input>;
  _set?: InputMaybe<Posts_Set_Input>;
  where: Posts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Posts_By_PkArgs = {
  _inc?: InputMaybe<Posts_Inc_Input>;
  _set?: InputMaybe<Posts_Set_Input>;
  pk_columns: Posts_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Posts_ManyArgs = {
  updates: Array<Posts_Updates>;
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
export type Mutation_RootUpdate_TagsArgs = {
  _inc?: InputMaybe<Tags_Inc_Input>;
  _set?: InputMaybe<Tags_Set_Input>;
  where: Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Tags_By_PkArgs = {
  _inc?: InputMaybe<Tags_Inc_Input>;
  _set?: InputMaybe<Tags_Set_Input>;
  pk_columns: Tags_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Tags_ManyArgs = {
  updates: Array<Tags_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_TasksArgs = {
  _append?: InputMaybe<Tasks_Append_Input>;
  _delete_at_path?: InputMaybe<Tasks_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tasks_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tasks_Delete_Key_Input>;
  _prepend?: InputMaybe<Tasks_Prepend_Input>;
  _set?: InputMaybe<Tasks_Set_Input>;
  where: Tasks_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Tasks_By_PkArgs = {
  _append?: InputMaybe<Tasks_Append_Input>;
  _delete_at_path?: InputMaybe<Tasks_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Tasks_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Tasks_Delete_Key_Input>;
  _prepend?: InputMaybe<Tasks_Prepend_Input>;
  _set?: InputMaybe<Tasks_Set_Input>;
  pk_columns: Tasks_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Tasks_ManyArgs = {
  updates: Array<Tasks_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_TestArgs = {
  _inc?: InputMaybe<Test_Inc_Input>;
  _set?: InputMaybe<Test_Set_Input>;
  where: Test_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Test_By_PkArgs = {
  _inc?: InputMaybe<Test_Inc_Input>;
  _set?: InputMaybe<Test_Set_Input>;
  pk_columns: Test_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Test_ManyArgs = {
  updates: Array<Test_Updates>;
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
export type Mutation_RootUpdate_UsersArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Video_TagsArgs = {
  _set?: InputMaybe<Video_Tags_Set_Input>;
  where: Video_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Video_Tags_By_PkArgs = {
  _set?: InputMaybe<Video_Tags_Set_Input>;
  pk_columns: Video_Tags_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Video_Tags_ManyArgs = {
  updates: Array<Video_Tags_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Video_ViewsArgs = {
  _set?: InputMaybe<Video_Views_Set_Input>;
  where: Video_Views_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Video_Views_By_PkArgs = {
  _set?: InputMaybe<Video_Views_Set_Input>;
  pk_columns: Video_Views_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Video_Views_ManyArgs = {
  updates: Array<Video_Views_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_VideosArgs = {
  _inc?: InputMaybe<Videos_Inc_Input>;
  _set?: InputMaybe<Videos_Set_Input>;
  where: Videos_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Videos_By_PkArgs = {
  _inc?: InputMaybe<Videos_Inc_Input>;
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
  updatedAt: Scalars['timestamptz']['output'];
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

/** aggregated selection of "notifications" */
export type Notifications_Aggregate = {
  __typename?: 'notifications_aggregate';
  aggregate?: Maybe<Notifications_Aggregate_Fields>;
  nodes: Array<Notifications>;
};

export type Notifications_Aggregate_Bool_Exp = {
  count?: InputMaybe<Notifications_Aggregate_Bool_Exp_Count>;
};

export type Notifications_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Notifications_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Notifications_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "notifications" */
export type Notifications_Aggregate_Fields = {
  __typename?: 'notifications_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Notifications_Max_Fields>;
  min?: Maybe<Notifications_Min_Fields>;
};


/** aggregate fields of "notifications" */
export type Notifications_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Notifications_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "notifications" */
export type Notifications_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Notifications_Max_Order_By>;
  min?: InputMaybe<Notifications_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Notifications_Append_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "notifications" */
export type Notifications_Arr_Rel_Insert_Input = {
  data: Array<Notifications_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Notifications_On_Conflict>;
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
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
};

/** unique or primary key constraints on table "notifications" */
export enum Notifications_Constraint {
  /** unique or primary key constraint on columns "id" */
  NotificationsPkey = 'notifications_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Notifications_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Notifications_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Notifications_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "notifications" */
export type Notifications_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  entityId?: InputMaybe<Scalars['uuid']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  readAt?: InputMaybe<Scalars['timestamptz']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Notifications_Max_Fields = {
  __typename?: 'notifications_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  entityId?: Maybe<Scalars['uuid']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  readAt?: Maybe<Scalars['timestamptz']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Notifications_Min_Fields = {
  __typename?: 'notifications_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  entityId?: Maybe<Scalars['uuid']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  readAt?: Maybe<Scalars['timestamptz']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  updatedAt?: InputMaybe<Order_By>;
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

/** on_conflict condition type for table "notifications" */
export type Notifications_On_Conflict = {
  constraint: Notifications_Constraint;
  update_columns?: Array<Notifications_Update_Column>;
  where?: InputMaybe<Notifications_Bool_Exp>;
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
  updatedAt?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
};

/** primary key columns input for table: notifications */
export type Notifications_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Notifications_Prepend_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
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
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "notifications" */
export type Notifications_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  entityId?: InputMaybe<Scalars['uuid']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  readAt?: InputMaybe<Scalars['timestamptz']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "notifications" */
export type Notifications_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Notifications_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Notifications_Stream_Cursor_Value_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  entityId?: InputMaybe<Scalars['uuid']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  readAt?: InputMaybe<Scalars['timestamptz']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "notifications" */
export enum Notifications_Update_Column {
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
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id'
}

export type Notifications_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Notifications_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Notifications_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Notifications_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Notifications_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Notifications_Prepend_Input>;
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
  DescNullsLast = 'desc_nulls_last'
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
  slug: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['timestamptz']['output'];
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

/** aggregated selection of "playlist" */
export type Playlist_Aggregate = {
  __typename?: 'playlist_aggregate';
  aggregate?: Maybe<Playlist_Aggregate_Fields>;
  nodes: Array<Playlist>;
};

export type Playlist_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Playlist_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Playlist_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Playlist_Aggregate_Bool_Exp_Count>;
};

export type Playlist_Aggregate_Bool_Exp_Bool_And = {
  arguments: Playlist_Select_Column_Playlist_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Playlist_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Playlist_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Playlist_Select_Column_Playlist_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Playlist_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Playlist_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Playlist_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Playlist_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "playlist" */
export type Playlist_Aggregate_Fields = {
  __typename?: 'playlist_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Playlist_Max_Fields>;
  min?: Maybe<Playlist_Min_Fields>;
};


/** aggregate fields of "playlist" */
export type Playlist_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Playlist_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "playlist" */
export type Playlist_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Playlist_Max_Order_By>;
  min?: InputMaybe<Playlist_Min_Order_By>;
};

/** input type for inserting array relation for remote table "playlist" */
export type Playlist_Arr_Rel_Insert_Input = {
  data: Array<Playlist_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Playlist_On_Conflict>;
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
  slug?: InputMaybe<String_Comparison_Exp>;
  thumbnailUrl?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
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
  PlaylistUserIdSlugKey = 'playlist_user_id_slug_key'
}

/** input type for inserting data into table "playlist" */
export type Playlist_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  playlist_videos?: InputMaybe<Playlist_Videos_Arr_Rel_Insert_Input>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** Short id like Youtube video id */
  sId?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Playlist_Max_Fields = {
  __typename?: 'playlist_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Short id like Youtube video id */
  sId?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Playlist_Min_Fields = {
  __typename?: 'playlist_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Short id like Youtube video id */
  sId?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
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
  updatedAt?: InputMaybe<Order_By>;
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
  slug?: InputMaybe<Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: playlist */
export type Playlist_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
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
  Slug = 'slug',
  /** column name */
  ThumbnailUrl = 'thumbnailUrl',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id'
}

/** select "playlist_aggregate_bool_exp_bool_and_arguments_columns" columns of table "playlist" */
export enum Playlist_Select_Column_Playlist_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Public = 'public'
}

/** select "playlist_aggregate_bool_exp_bool_or_arguments_columns" columns of table "playlist" */
export enum Playlist_Select_Column_Playlist_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Public = 'public'
}

/** input type for updating data in table "playlist" */
export type Playlist_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** Short id like Youtube video id */
  sId?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
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
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "playlist" */
export enum Playlist_Update_Column {
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
  Slug = 'slug',
  /** column name */
  ThumbnailUrl = 'thumbnailUrl',
  /** column name */
  Title = 'title',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id'
}

export type Playlist_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Playlist_Set_Input>;
  /** filter the rows which have to be updated */
  where: Playlist_Bool_Exp;
};

/** Junction table between videos and playlist */
export type Playlist_Videos = {
  __typename?: 'playlist_videos';
  createdAt: Scalars['timestamptz']['output'];
  /** An object relationship */
  playlist: Playlist;
  playlist_id: Scalars['uuid']['output'];
  position: Scalars['Int']['output'];
  updatedAt: Scalars['timestamptz']['output'];
  /** An object relationship */
  video: Videos;
  video_id: Scalars['uuid']['output'];
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
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  playlist?: InputMaybe<Playlist_Bool_Exp>;
  playlist_id?: InputMaybe<Uuid_Comparison_Exp>;
  position?: InputMaybe<Int_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "playlist_videos" */
export enum Playlist_Videos_Constraint {
  /** unique or primary key constraint on columns "video_id", "playlist_id" */
  PlaylistVideosPkey = 'playlist_videos_pkey'
}

/** input type for incrementing numeric columns in table "playlist_videos" */
export type Playlist_Videos_Inc_Input = {
  position?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "playlist_videos" */
export type Playlist_Videos_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  playlist?: InputMaybe<Playlist_Obj_Rel_Insert_Input>;
  playlist_id?: InputMaybe<Scalars['uuid']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Playlist_Videos_Max_Fields = {
  __typename?: 'playlist_videos_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  playlist_id?: Maybe<Scalars['uuid']['output']>;
  position?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "playlist_videos" */
export type Playlist_Videos_Max_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  playlist_id?: InputMaybe<Order_By>;
  position?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Playlist_Videos_Min_Fields = {
  __typename?: 'playlist_videos_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  playlist_id?: Maybe<Scalars['uuid']['output']>;
  position?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "playlist_videos" */
export type Playlist_Videos_Min_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  playlist_id?: InputMaybe<Order_By>;
  position?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
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
  createdAt?: InputMaybe<Order_By>;
  playlist?: InputMaybe<Playlist_Order_By>;
  playlist_id?: InputMaybe<Order_By>;
  position?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: playlist_videos */
export type Playlist_Videos_Pk_Columns_Input = {
  playlist_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};

/** select columns of table "playlist_videos" */
export enum Playlist_Videos_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  PlaylistId = 'playlist_id',
  /** column name */
  Position = 'position',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  VideoId = 'video_id'
}

/** input type for updating data in table "playlist_videos" */
export type Playlist_Videos_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  playlist_id?: InputMaybe<Scalars['uuid']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

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

/** Streaming cursor of the table "playlist_videos" */
export type Playlist_Videos_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Playlist_Videos_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Playlist_Videos_Stream_Cursor_Value_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  playlist_id?: InputMaybe<Scalars['uuid']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
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

/** update columns of table "playlist_videos" */
export enum Playlist_Videos_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  PlaylistId = 'playlist_id',
  /** column name */
  Position = 'position',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  VideoId = 'video_id'
}

export type Playlist_Videos_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Playlist_Videos_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Playlist_Videos_Set_Input>;
  /** filter the rows which have to be updated */
  where: Playlist_Videos_Bool_Exp;
};

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
  created_at: Scalars['timestamptz']['output'];
  /** Hashnode public id */
  hId: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  markdownContent: Scalars['String']['output'];
  readTimeInMinutes: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "posts" */
export type Posts_Aggregate = {
  __typename?: 'posts_aggregate';
  aggregate?: Maybe<Posts_Aggregate_Fields>;
  nodes: Array<Posts>;
};

/** aggregate fields of "posts" */
export type Posts_Aggregate_Fields = {
  __typename?: 'posts_aggregate_fields';
  avg?: Maybe<Posts_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Posts_Max_Fields>;
  min?: Maybe<Posts_Min_Fields>;
  stddev?: Maybe<Posts_Stddev_Fields>;
  stddev_pop?: Maybe<Posts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Posts_Stddev_Samp_Fields>;
  sum?: Maybe<Posts_Sum_Fields>;
  var_pop?: Maybe<Posts_Var_Pop_Fields>;
  var_samp?: Maybe<Posts_Var_Samp_Fields>;
  variance?: Maybe<Posts_Variance_Fields>;
};


/** aggregate fields of "posts" */
export type Posts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Posts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Posts_Avg_Fields = {
  __typename?: 'posts_avg_fields';
  readTimeInMinutes?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "posts". All fields are combined with a logical 'AND'. */
export type Posts_Bool_Exp = {
  _and?: InputMaybe<Array<Posts_Bool_Exp>>;
  _not?: InputMaybe<Posts_Bool_Exp>;
  _or?: InputMaybe<Array<Posts_Bool_Exp>>;
  brief?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  hId?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  markdownContent?: InputMaybe<String_Comparison_Exp>;
  readTimeInMinutes?: InputMaybe<Int_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "posts" */
export enum Posts_Constraint {
  /** unique or primary key constraint on columns "id" */
  PostsPkey = 'posts_pkey',
  /** unique or primary key constraint on columns "slug" */
  PostsSlugKey = 'posts_slug_key'
}

/** input type for incrementing numeric columns in table "posts" */
export type Posts_Inc_Input = {
  readTimeInMinutes?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "posts" */
export type Posts_Insert_Input = {
  brief?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Hashnode public id */
  hId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  markdownContent?: InputMaybe<Scalars['String']['input']>;
  readTimeInMinutes?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Posts_Max_Fields = {
  __typename?: 'posts_max_fields';
  brief?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Hashnode public id */
  hId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  markdownContent?: Maybe<Scalars['String']['output']>;
  readTimeInMinutes?: Maybe<Scalars['Int']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Posts_Min_Fields = {
  __typename?: 'posts_min_fields';
  brief?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** Hashnode public id */
  hId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  markdownContent?: Maybe<Scalars['String']['output']>;
  readTimeInMinutes?: Maybe<Scalars['Int']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "posts" */
export type Posts_Mutation_Response = {
  __typename?: 'posts_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Posts>;
};

/** on_conflict condition type for table "posts" */
export type Posts_On_Conflict = {
  constraint: Posts_Constraint;
  update_columns?: Array<Posts_Update_Column>;
  where?: InputMaybe<Posts_Bool_Exp>;
};

/** Ordering options when selecting data from "posts". */
export type Posts_Order_By = {
  brief?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  hId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  markdownContent?: InputMaybe<Order_By>;
  readTimeInMinutes?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: posts */
export type Posts_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "posts" */
export enum Posts_Select_Column {
  /** column name */
  Brief = 'brief',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  HId = 'hId',
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
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "posts" */
export type Posts_Set_Input = {
  brief?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Hashnode public id */
  hId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  markdownContent?: InputMaybe<Scalars['String']['input']>;
  readTimeInMinutes?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Posts_Stddev_Fields = {
  __typename?: 'posts_stddev_fields';
  readTimeInMinutes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Posts_Stddev_Pop_Fields = {
  __typename?: 'posts_stddev_pop_fields';
  readTimeInMinutes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Posts_Stddev_Samp_Fields = {
  __typename?: 'posts_stddev_samp_fields';
  readTimeInMinutes?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "posts" */
export type Posts_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Posts_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Posts_Stream_Cursor_Value_Input = {
  brief?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  /** Hashnode public id */
  hId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  markdownContent?: InputMaybe<Scalars['String']['input']>;
  readTimeInMinutes?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Posts_Sum_Fields = {
  __typename?: 'posts_sum_fields';
  readTimeInMinutes?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "posts" */
export enum Posts_Update_Column {
  /** column name */
  Brief = 'brief',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  HId = 'hId',
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
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Posts_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Posts_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Posts_Set_Input>;
  /** filter the rows which have to be updated */
  where: Posts_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Posts_Var_Pop_Fields = {
  __typename?: 'posts_var_pop_fields';
  readTimeInMinutes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Posts_Var_Samp_Fields = {
  __typename?: 'posts_var_samp_fields';
  readTimeInMinutes?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Posts_Variance_Fields = {
  __typename?: 'posts_variance_fields';
  readTimeInMinutes?: Maybe<Scalars['Float']['output']>;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** An array relationship */
  audio_tags: Array<Audio_Tags>;
  /** An aggregate relationship */
  audio_tags_aggregate: Audio_Tags_Aggregate;
  /** fetch data from the table: "audio_tags" using primary key columns */
  audio_tags_by_pk?: Maybe<Audio_Tags>;
  /** An array relationship */
  audios: Array<Audios>;
  /** An aggregate relationship */
  audios_aggregate: Audios_Aggregate;
  /** fetch data from the table: "audios" using primary key columns */
  audios_by_pk?: Maybe<Audios>;
  /** An array relationship */
  crawl_requests: Array<Crawl_Requests>;
  /** An aggregate relationship */
  crawl_requests_aggregate: Crawl_Requests_Aggregate;
  /** fetch data from the table: "crawl_requests" using primary key columns */
  crawl_requests_by_pk?: Maybe<Crawl_Requests>;
  /** fetch data from the table: "feature_flag" */
  feature_flag: Array<Feature_Flag>;
  /** fetch aggregated fields from the table: "feature_flag" */
  feature_flag_aggregate: Feature_Flag_Aggregate;
  /** fetch data from the table: "feature_flag" using primary key columns */
  feature_flag_by_pk?: Maybe<Feature_Flag>;
  /** fetch data from the table: "finance_transactions" */
  finance_transactions: Array<Finance_Transactions>;
  /** fetch aggregated fields from the table: "finance_transactions" */
  finance_transactions_aggregate: Finance_Transactions_Aggregate;
  /** fetch data from the table: "finance_transactions" using primary key columns */
  finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** fetch data from the table: "journals" */
  journals: Array<Journals>;
  /** fetch aggregated fields from the table: "journals" */
  journals_aggregate: Journals_Aggregate;
  /** fetch data from the table: "journals" using primary key columns */
  journals_by_pk?: Maybe<Journals>;
  /** An array relationship */
  notifications: Array<Notifications>;
  /** An aggregate relationship */
  notifications_aggregate: Notifications_Aggregate;
  /** fetch data from the table: "notifications" using primary key columns */
  notifications_by_pk?: Maybe<Notifications>;
  /** fetch data from the table: "playlist" */
  playlist: Array<Playlist>;
  /** fetch aggregated fields from the table: "playlist" */
  playlist_aggregate: Playlist_Aggregate;
  /** fetch data from the table: "playlist" using primary key columns */
  playlist_by_pk?: Maybe<Playlist>;
  /** An array relationship */
  playlist_videos: Array<Playlist_Videos>;
  /** An aggregate relationship */
  playlist_videos_aggregate: Playlist_Videos_Aggregate;
  /** fetch data from the table: "playlist_videos" using primary key columns */
  playlist_videos_by_pk?: Maybe<Playlist_Videos>;
  /** fetch data from the table: "posts" */
  posts: Array<Posts>;
  /** fetch aggregated fields from the table: "posts" */
  posts_aggregate: Posts_Aggregate;
  /** fetch data from the table: "posts" using primary key columns */
  posts_by_pk?: Maybe<Posts>;
  /** An array relationship */
  subtitles: Array<Subtitles>;
  /** An aggregate relationship */
  subtitles_aggregate: Subtitles_Aggregate;
  /** fetch data from the table: "subtitles" using primary key columns */
  subtitles_by_pk?: Maybe<Subtitles>;
  /** fetch data from the table: "tags" */
  tags: Array<Tags>;
  /** fetch aggregated fields from the table: "tags" */
  tags_aggregate: Tags_Aggregate;
  /** fetch data from the table: "tags" using primary key columns */
  tags_by_pk?: Maybe<Tags>;
  /** fetch data from the table: "tasks" */
  tasks: Array<Tasks>;
  /** fetch aggregated fields from the table: "tasks" */
  tasks_aggregate: Tasks_Aggregate;
  /** fetch data from the table: "tasks" using primary key columns */
  tasks_by_pk?: Maybe<Tasks>;
  /** fetch data from the table: "test" */
  test: Array<Test>;
  /** fetch aggregated fields from the table: "test" */
  test_aggregate: Test_Aggregate;
  /** fetch data from the table: "test" using primary key columns */
  test_by_pk?: Maybe<Test>;
  /** fetch data from the table: "user_video_history" */
  user_video_history: Array<User_Video_History>;
  /** fetch aggregated fields from the table: "user_video_history" */
  user_video_history_aggregate: User_Video_History_Aggregate;
  /** fetch data from the table: "user_video_history" using primary key columns */
  user_video_history_by_pk?: Maybe<User_Video_History>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** An array relationship */
  video_tags: Array<Video_Tags>;
  /** An aggregate relationship */
  video_tags_aggregate: Video_Tags_Aggregate;
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
  /** An aggregate relationship */
  videos_aggregate: Videos_Aggregate;
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


export type Query_RootAudio_Tags_AggregateArgs = {
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


export type Query_RootAudios_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Audios_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audios_Order_By>>;
  where?: InputMaybe<Audios_Bool_Exp>;
};


export type Query_RootAudios_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootCrawl_RequestsArgs = {
  distinct_on?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Crawl_Requests_Order_By>>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};


export type Query_RootCrawl_Requests_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Crawl_Requests_Order_By>>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};


export type Query_RootCrawl_Requests_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootFeature_FlagArgs = {
  distinct_on?: InputMaybe<Array<Feature_Flag_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Feature_Flag_Order_By>>;
  where?: InputMaybe<Feature_Flag_Bool_Exp>;
};


export type Query_RootFeature_Flag_AggregateArgs = {
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


export type Query_RootNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Query_RootNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Query_RootNotifications_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPlaylistArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Order_By>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};


export type Query_RootPlaylist_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Order_By>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};


export type Query_RootPlaylist_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPlaylist_VideosArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};


export type Query_RootPlaylist_Videos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};


export type Query_RootPlaylist_Videos_By_PkArgs = {
  playlist_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};


export type Query_RootPostsArgs = {
  distinct_on?: InputMaybe<Array<Posts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Posts_Order_By>>;
  where?: InputMaybe<Posts_Bool_Exp>;
};


export type Query_RootPosts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Posts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Posts_Order_By>>;
  where?: InputMaybe<Posts_Bool_Exp>;
};


export type Query_RootPosts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootSubtitlesArgs = {
  distinct_on?: InputMaybe<Array<Subtitles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Subtitles_Order_By>>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};


export type Query_RootSubtitles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Subtitles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Subtitles_Order_By>>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};


export type Query_RootSubtitles_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTagsArgs = {
  distinct_on?: InputMaybe<Array<Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tags_Order_By>>;
  where?: InputMaybe<Tags_Bool_Exp>;
};


export type Query_RootTags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tags_Order_By>>;
  where?: InputMaybe<Tags_Bool_Exp>;
};


export type Query_RootTags_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTasksArgs = {
  distinct_on?: InputMaybe<Array<Tasks_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tasks_Order_By>>;
  where?: InputMaybe<Tasks_Bool_Exp>;
};


export type Query_RootTasks_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tasks_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tasks_Order_By>>;
  where?: InputMaybe<Tasks_Bool_Exp>;
};


export type Query_RootTasks_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootTestArgs = {
  distinct_on?: InputMaybe<Array<Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Test_Order_By>>;
  where?: InputMaybe<Test_Bool_Exp>;
};


export type Query_RootTest_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Test_Order_By>>;
  where?: InputMaybe<Test_Bool_Exp>;
};


export type Query_RootTest_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Query_RootUser_Video_HistoryArgs = {
  distinct_on?: InputMaybe<Array<User_Video_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Video_History_Order_By>>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};


export type Query_RootUser_Video_History_AggregateArgs = {
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


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootVideo_TagsArgs = {
  distinct_on?: InputMaybe<Array<Video_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Tags_Order_By>>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};


export type Query_RootVideo_Tags_AggregateArgs = {
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


export type Query_RootVideos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Videos_Order_By>>;
  where?: InputMaybe<Videos_Bool_Exp>;
};


export type Query_RootVideos_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** An array relationship */
  audio_tags: Array<Audio_Tags>;
  /** An aggregate relationship */
  audio_tags_aggregate: Audio_Tags_Aggregate;
  /** fetch data from the table: "audio_tags" using primary key columns */
  audio_tags_by_pk?: Maybe<Audio_Tags>;
  /** fetch data from the table in a streaming manner: "audio_tags" */
  audio_tags_stream: Array<Audio_Tags>;
  /** An array relationship */
  audios: Array<Audios>;
  /** An aggregate relationship */
  audios_aggregate: Audios_Aggregate;
  /** fetch data from the table: "audios" using primary key columns */
  audios_by_pk?: Maybe<Audios>;
  /** fetch data from the table in a streaming manner: "audios" */
  audios_stream: Array<Audios>;
  /** An array relationship */
  crawl_requests: Array<Crawl_Requests>;
  /** An aggregate relationship */
  crawl_requests_aggregate: Crawl_Requests_Aggregate;
  /** fetch data from the table: "crawl_requests" using primary key columns */
  crawl_requests_by_pk?: Maybe<Crawl_Requests>;
  /** fetch data from the table in a streaming manner: "crawl_requests" */
  crawl_requests_stream: Array<Crawl_Requests>;
  /** fetch data from the table: "feature_flag" */
  feature_flag: Array<Feature_Flag>;
  /** fetch aggregated fields from the table: "feature_flag" */
  feature_flag_aggregate: Feature_Flag_Aggregate;
  /** fetch data from the table: "feature_flag" using primary key columns */
  feature_flag_by_pk?: Maybe<Feature_Flag>;
  /** fetch data from the table in a streaming manner: "feature_flag" */
  feature_flag_stream: Array<Feature_Flag>;
  /** fetch data from the table: "finance_transactions" */
  finance_transactions: Array<Finance_Transactions>;
  /** fetch aggregated fields from the table: "finance_transactions" */
  finance_transactions_aggregate: Finance_Transactions_Aggregate;
  /** fetch data from the table: "finance_transactions" using primary key columns */
  finance_transactions_by_pk?: Maybe<Finance_Transactions>;
  /** fetch data from the table in a streaming manner: "finance_transactions" */
  finance_transactions_stream: Array<Finance_Transactions>;
  /** fetch data from the table: "journals" */
  journals: Array<Journals>;
  /** fetch aggregated fields from the table: "journals" */
  journals_aggregate: Journals_Aggregate;
  /** fetch data from the table: "journals" using primary key columns */
  journals_by_pk?: Maybe<Journals>;
  /** fetch data from the table in a streaming manner: "journals" */
  journals_stream: Array<Journals>;
  /** An array relationship */
  notifications: Array<Notifications>;
  /** An aggregate relationship */
  notifications_aggregate: Notifications_Aggregate;
  /** fetch data from the table: "notifications" using primary key columns */
  notifications_by_pk?: Maybe<Notifications>;
  /** fetch data from the table in a streaming manner: "notifications" */
  notifications_stream: Array<Notifications>;
  /** fetch data from the table: "playlist" */
  playlist: Array<Playlist>;
  /** fetch aggregated fields from the table: "playlist" */
  playlist_aggregate: Playlist_Aggregate;
  /** fetch data from the table: "playlist" using primary key columns */
  playlist_by_pk?: Maybe<Playlist>;
  /** fetch data from the table in a streaming manner: "playlist" */
  playlist_stream: Array<Playlist>;
  /** An array relationship */
  playlist_videos: Array<Playlist_Videos>;
  /** An aggregate relationship */
  playlist_videos_aggregate: Playlist_Videos_Aggregate;
  /** fetch data from the table: "playlist_videos" using primary key columns */
  playlist_videos_by_pk?: Maybe<Playlist_Videos>;
  /** fetch data from the table in a streaming manner: "playlist_videos" */
  playlist_videos_stream: Array<Playlist_Videos>;
  /** fetch data from the table: "posts" */
  posts: Array<Posts>;
  /** fetch aggregated fields from the table: "posts" */
  posts_aggregate: Posts_Aggregate;
  /** fetch data from the table: "posts" using primary key columns */
  posts_by_pk?: Maybe<Posts>;
  /** fetch data from the table in a streaming manner: "posts" */
  posts_stream: Array<Posts>;
  /** An array relationship */
  subtitles: Array<Subtitles>;
  /** An aggregate relationship */
  subtitles_aggregate: Subtitles_Aggregate;
  /** fetch data from the table: "subtitles" using primary key columns */
  subtitles_by_pk?: Maybe<Subtitles>;
  /** fetch data from the table in a streaming manner: "subtitles" */
  subtitles_stream: Array<Subtitles>;
  /** fetch data from the table: "tags" */
  tags: Array<Tags>;
  /** fetch aggregated fields from the table: "tags" */
  tags_aggregate: Tags_Aggregate;
  /** fetch data from the table: "tags" using primary key columns */
  tags_by_pk?: Maybe<Tags>;
  /** fetch data from the table in a streaming manner: "tags" */
  tags_stream: Array<Tags>;
  /** fetch data from the table: "tasks" */
  tasks: Array<Tasks>;
  /** fetch aggregated fields from the table: "tasks" */
  tasks_aggregate: Tasks_Aggregate;
  /** fetch data from the table: "tasks" using primary key columns */
  tasks_by_pk?: Maybe<Tasks>;
  /** fetch data from the table in a streaming manner: "tasks" */
  tasks_stream: Array<Tasks>;
  /** fetch data from the table: "test" */
  test: Array<Test>;
  /** fetch aggregated fields from the table: "test" */
  test_aggregate: Test_Aggregate;
  /** fetch data from the table: "test" using primary key columns */
  test_by_pk?: Maybe<Test>;
  /** fetch data from the table in a streaming manner: "test" */
  test_stream: Array<Test>;
  /** fetch data from the table: "user_video_history" */
  user_video_history: Array<User_Video_History>;
  /** fetch aggregated fields from the table: "user_video_history" */
  user_video_history_aggregate: User_Video_History_Aggregate;
  /** fetch data from the table: "user_video_history" using primary key columns */
  user_video_history_by_pk?: Maybe<User_Video_History>;
  /** fetch data from the table in a streaming manner: "user_video_history" */
  user_video_history_stream: Array<User_Video_History>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
  /** An array relationship */
  video_tags: Array<Video_Tags>;
  /** An aggregate relationship */
  video_tags_aggregate: Video_Tags_Aggregate;
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
  /** An aggregate relationship */
  videos_aggregate: Videos_Aggregate;
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


export type Subscription_RootAudio_Tags_AggregateArgs = {
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


export type Subscription_RootAudios_AggregateArgs = {
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


export type Subscription_RootCrawl_RequestsArgs = {
  distinct_on?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Crawl_Requests_Order_By>>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};


export type Subscription_RootCrawl_Requests_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Crawl_Requests_Order_By>>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};


export type Subscription_RootCrawl_Requests_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootCrawl_Requests_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Crawl_Requests_Stream_Cursor_Input>>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};


export type Subscription_RootFeature_FlagArgs = {
  distinct_on?: InputMaybe<Array<Feature_Flag_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Feature_Flag_Order_By>>;
  where?: InputMaybe<Feature_Flag_Bool_Exp>;
};


export type Subscription_RootFeature_Flag_AggregateArgs = {
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


export type Subscription_RootFinance_Transactions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Finance_Transactions_Stream_Cursor_Input>>;
  where?: InputMaybe<Finance_Transactions_Bool_Exp>;
};


export type Subscription_RootJournalsArgs = {
  distinct_on?: InputMaybe<Array<Journals_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Journals_Order_By>>;
  where?: InputMaybe<Journals_Bool_Exp>;
};


export type Subscription_RootJournals_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Journals_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Journals_Order_By>>;
  where?: InputMaybe<Journals_Bool_Exp>;
};


export type Subscription_RootJournals_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootJournals_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Journals_Stream_Cursor_Input>>;
  where?: InputMaybe<Journals_Bool_Exp>;
};


export type Subscription_RootNotificationsArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Subscription_RootNotifications_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Notifications_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Notifications_Order_By>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Subscription_RootNotifications_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootNotifications_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Notifications_Stream_Cursor_Input>>;
  where?: InputMaybe<Notifications_Bool_Exp>;
};


export type Subscription_RootPlaylistArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Order_By>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
};


export type Subscription_RootPlaylist_AggregateArgs = {
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


export type Subscription_RootPlaylist_VideosArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};


export type Subscription_RootPlaylist_Videos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Videos_Order_By>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};


export type Subscription_RootPlaylist_Videos_By_PkArgs = {
  playlist_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};


export type Subscription_RootPlaylist_Videos_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Playlist_Videos_Stream_Cursor_Input>>;
  where?: InputMaybe<Playlist_Videos_Bool_Exp>;
};


export type Subscription_RootPostsArgs = {
  distinct_on?: InputMaybe<Array<Posts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Posts_Order_By>>;
  where?: InputMaybe<Posts_Bool_Exp>;
};


export type Subscription_RootPosts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Posts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Posts_Order_By>>;
  where?: InputMaybe<Posts_Bool_Exp>;
};


export type Subscription_RootPosts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPosts_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Posts_Stream_Cursor_Input>>;
  where?: InputMaybe<Posts_Bool_Exp>;
};


export type Subscription_RootSubtitlesArgs = {
  distinct_on?: InputMaybe<Array<Subtitles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Subtitles_Order_By>>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};


export type Subscription_RootSubtitles_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Subtitles_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Subtitles_Order_By>>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};


export type Subscription_RootSubtitles_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootSubtitles_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Subtitles_Stream_Cursor_Input>>;
  where?: InputMaybe<Subtitles_Bool_Exp>;
};


export type Subscription_RootTagsArgs = {
  distinct_on?: InputMaybe<Array<Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tags_Order_By>>;
  where?: InputMaybe<Tags_Bool_Exp>;
};


export type Subscription_RootTags_AggregateArgs = {
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


export type Subscription_RootTasksArgs = {
  distinct_on?: InputMaybe<Array<Tasks_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tasks_Order_By>>;
  where?: InputMaybe<Tasks_Bool_Exp>;
};


export type Subscription_RootTasks_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Tasks_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Tasks_Order_By>>;
  where?: InputMaybe<Tasks_Bool_Exp>;
};


export type Subscription_RootTasks_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootTasks_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Tasks_Stream_Cursor_Input>>;
  where?: InputMaybe<Tasks_Bool_Exp>;
};


export type Subscription_RootTestArgs = {
  distinct_on?: InputMaybe<Array<Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Test_Order_By>>;
  where?: InputMaybe<Test_Bool_Exp>;
};


export type Subscription_RootTest_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Test_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Test_Order_By>>;
  where?: InputMaybe<Test_Bool_Exp>;
};


export type Subscription_RootTest_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Subscription_RootTest_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Test_Stream_Cursor_Input>>;
  where?: InputMaybe<Test_Bool_Exp>;
};


export type Subscription_RootUser_Video_HistoryArgs = {
  distinct_on?: InputMaybe<Array<User_Video_History_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Video_History_Order_By>>;
  where?: InputMaybe<User_Video_History_Bool_Exp>;
};


export type Subscription_RootUser_Video_History_AggregateArgs = {
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


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
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


export type Subscription_RootVideo_Tags_AggregateArgs = {
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


export type Subscription_RootVideos_AggregateArgs = {
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
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  isDefault: Scalars['Boolean']['output'];
  lang: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  url: Scalars['String']['output'];
  /** An object relationship */
  video: Videos;
  video_id: Scalars['uuid']['output'];
};

/** aggregated selection of "subtitles" */
export type Subtitles_Aggregate = {
  __typename?: 'subtitles_aggregate';
  aggregate?: Maybe<Subtitles_Aggregate_Fields>;
  nodes: Array<Subtitles>;
};

export type Subtitles_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Subtitles_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Subtitles_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Subtitles_Aggregate_Bool_Exp_Count>;
};

export type Subtitles_Aggregate_Bool_Exp_Bool_And = {
  arguments: Subtitles_Select_Column_Subtitles_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Subtitles_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Subtitles_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Subtitles_Select_Column_Subtitles_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Subtitles_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Subtitles_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Subtitles_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Subtitles_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "subtitles" */
export type Subtitles_Aggregate_Fields = {
  __typename?: 'subtitles_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Subtitles_Max_Fields>;
  min?: Maybe<Subtitles_Min_Fields>;
};


/** aggregate fields of "subtitles" */
export type Subtitles_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Subtitles_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
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
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  isDefault?: InputMaybe<Boolean_Comparison_Exp>;
  lang?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  url?: InputMaybe<String_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "subtitles" */
export enum Subtitles_Constraint {
  /** unique or primary key constraint on columns "id" */
  SubtitlesPkey = 'subtitles_pkey'
}

/** input type for inserting data into table "subtitles" */
export type Subtitles_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Subtitles_Max_Fields = {
  __typename?: 'subtitles_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lang?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "subtitles" */
export type Subtitles_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lang?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Subtitles_Min_Fields = {
  __typename?: 'subtitles_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  lang?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "subtitles" */
export type Subtitles_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lang?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
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
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  isDefault?: InputMaybe<Order_By>;
  lang?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  url?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: subtitles */
export type Subtitles_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "subtitles" */
export enum Subtitles_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsDefault = 'isDefault',
  /** column name */
  Lang = 'lang',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Url = 'url',
  /** column name */
  VideoId = 'video_id'
}

/** select "subtitles_aggregate_bool_exp_bool_and_arguments_columns" columns of table "subtitles" */
export enum Subtitles_Select_Column_Subtitles_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsDefault = 'isDefault'
}

/** select "subtitles_aggregate_bool_exp_bool_or_arguments_columns" columns of table "subtitles" */
export enum Subtitles_Select_Column_Subtitles_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsDefault = 'isDefault'
}

/** input type for updating data in table "subtitles" */
export type Subtitles_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "subtitles" */
export type Subtitles_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Subtitles_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Subtitles_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  lang?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "subtitles" */
export enum Subtitles_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  IsDefault = 'isDefault',
  /** column name */
  Lang = 'lang',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Url = 'url',
  /** column name */
  VideoId = 'video_id'
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
  /** An aggregate relationship */
  audio_tags_aggregate: Audio_Tags_Aggregate;
  created_at: Scalars['timestamptz']['output'];
  description?: Maybe<Scalars['String']['output']>;
  display_order: Scalars['Int']['output'];
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  site: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
  /** An array relationship */
  video_tags: Array<Video_Tags>;
  /** An aggregate relationship */
  video_tags_aggregate: Video_Tags_Aggregate;
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
export type TagsAudio_Tags_AggregateArgs = {
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


/** Including all tags for all sites (watch, listen, etc). Tags can have name and slug, slug + site is unique */
export type TagsVideo_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Video_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Video_Tags_Order_By>>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};

/** aggregated selection of "tags" */
export type Tags_Aggregate = {
  __typename?: 'tags_aggregate';
  aggregate?: Maybe<Tags_Aggregate_Fields>;
  nodes: Array<Tags>;
};

/** aggregate fields of "tags" */
export type Tags_Aggregate_Fields = {
  __typename?: 'tags_aggregate_fields';
  avg?: Maybe<Tags_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Tags_Max_Fields>;
  min?: Maybe<Tags_Min_Fields>;
  stddev?: Maybe<Tags_Stddev_Fields>;
  stddev_pop?: Maybe<Tags_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Tags_Stddev_Samp_Fields>;
  sum?: Maybe<Tags_Sum_Fields>;
  var_pop?: Maybe<Tags_Var_Pop_Fields>;
  var_samp?: Maybe<Tags_Var_Samp_Fields>;
  variance?: Maybe<Tags_Variance_Fields>;
};


/** aggregate fields of "tags" */
export type Tags_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Tags_Avg_Fields = {
  __typename?: 'tags_avg_fields';
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "tags". All fields are combined with a logical 'AND'. */
export type Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Tags_Bool_Exp>>;
  _not?: InputMaybe<Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Tags_Bool_Exp>>;
  audio_tags?: InputMaybe<Audio_Tags_Bool_Exp>;
  audio_tags_aggregate?: InputMaybe<Audio_Tags_Aggregate_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  display_order?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  site?: InputMaybe<String_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  video_tags?: InputMaybe<Video_Tags_Bool_Exp>;
  video_tags_aggregate?: InputMaybe<Video_Tags_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "tags" */
export enum Tags_Constraint {
  /** unique or primary key constraint on columns "id" */
  TagsPkey = 'tags_pkey',
  /** unique or primary key constraint on columns "slug", "site" */
  TagsSlugSiteKey = 'tags_slug_site_key'
}

/** input type for incrementing numeric columns in table "tags" */
export type Tags_Inc_Input = {
  display_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "tags" */
export type Tags_Insert_Input = {
  audio_tags?: InputMaybe<Audio_Tags_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  display_order?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  video_tags?: InputMaybe<Video_Tags_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Tags_Max_Fields = {
  __typename?: 'tags_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  display_order?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  site?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Tags_Min_Fields = {
  __typename?: 'tags_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  display_order?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  site?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "tags" */
export type Tags_Mutation_Response = {
  __typename?: 'tags_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Tags>;
};

/** input type for inserting object relation for remote table "tags" */
export type Tags_Obj_Rel_Insert_Input = {
  data: Tags_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Tags_On_Conflict>;
};

/** on_conflict condition type for table "tags" */
export type Tags_On_Conflict = {
  constraint: Tags_Constraint;
  update_columns?: Array<Tags_Update_Column>;
  where?: InputMaybe<Tags_Bool_Exp>;
};

/** Ordering options when selecting data from "tags". */
export type Tags_Order_By = {
  audio_tags_aggregate?: InputMaybe<Audio_Tags_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  description?: InputMaybe<Order_By>;
  display_order?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  site?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  video_tags_aggregate?: InputMaybe<Video_Tags_Aggregate_Order_By>;
};

/** primary key columns input for table: tags */
export type Tags_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "tags" */
export enum Tags_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
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
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "tags" */
export type Tags_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  display_order?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Tags_Stddev_Fields = {
  __typename?: 'tags_stddev_fields';
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Tags_Stddev_Pop_Fields = {
  __typename?: 'tags_stddev_pop_fields';
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Tags_Stddev_Samp_Fields = {
  __typename?: 'tags_stddev_samp_fields';
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "tags" */
export type Tags_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tags_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tags_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  display_order?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  site?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Tags_Sum_Fields = {
  __typename?: 'tags_sum_fields';
  display_order?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "tags" */
export enum Tags_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
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
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Tags_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Tags_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tags_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tags_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Tags_Var_Pop_Fields = {
  __typename?: 'tags_var_pop_fields';
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Tags_Var_Samp_Fields = {
  __typename?: 'tags_var_samp_fields';
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Tags_Variance_Fields = {
  __typename?: 'tags_variance_fields';
  display_order?: Maybe<Scalars['Float']['output']>;
};

/** Reference for Cloud Tasks, the goal is idempotent for Cloud Tasks */
export type Tasks = {
  __typename?: 'tasks';
  completed: Scalars['Boolean']['output'];
  created_at: Scalars['timestamptz']['output'];
  entity_id: Scalars['uuid']['output'];
  entity_type: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  metadata: Scalars['jsonb']['output'];
  status: Scalars['String']['output'];
  task_id: Scalars['uuid']['output'];
  type: Scalars['String']['output'];
  updated_at: Scalars['timestamptz']['output'];
};


/** Reference for Cloud Tasks, the goal is idempotent for Cloud Tasks */
export type TasksMetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "tasks" */
export type Tasks_Aggregate = {
  __typename?: 'tasks_aggregate';
  aggregate?: Maybe<Tasks_Aggregate_Fields>;
  nodes: Array<Tasks>;
};

/** aggregate fields of "tasks" */
export type Tasks_Aggregate_Fields = {
  __typename?: 'tasks_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Tasks_Max_Fields>;
  min?: Maybe<Tasks_Min_Fields>;
};


/** aggregate fields of "tasks" */
export type Tasks_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Tasks_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Tasks_Append_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "tasks". All fields are combined with a logical 'AND'. */
export type Tasks_Bool_Exp = {
  _and?: InputMaybe<Array<Tasks_Bool_Exp>>;
  _not?: InputMaybe<Tasks_Bool_Exp>;
  _or?: InputMaybe<Array<Tasks_Bool_Exp>>;
  completed?: InputMaybe<Boolean_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  entity_id?: InputMaybe<Uuid_Comparison_Exp>;
  entity_type?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  task_id?: InputMaybe<Uuid_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "tasks" */
export enum Tasks_Constraint {
  /** unique or primary key constraint on columns "entity_type", "type", "entity_id" */
  TasksEntityTypeEntityIdTypeKey = 'tasks_entity_type_entity_id_type_key',
  /** unique or primary key constraint on columns "id" */
  TasksPkey = 'tasks_pkey',
  /** unique or primary key constraint on columns "task_id" */
  TasksTaskIdKey = 'tasks_task_id_key'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Tasks_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Tasks_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Tasks_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "tasks" */
export type Tasks_Insert_Input = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  entity_id?: InputMaybe<Scalars['uuid']['input']>;
  entity_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  task_id?: InputMaybe<Scalars['uuid']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Tasks_Max_Fields = {
  __typename?: 'tasks_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  entity_id?: Maybe<Scalars['uuid']['output']>;
  entity_type?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  task_id?: Maybe<Scalars['uuid']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Tasks_Min_Fields = {
  __typename?: 'tasks_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  entity_id?: Maybe<Scalars['uuid']['output']>;
  entity_type?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  task_id?: Maybe<Scalars['uuid']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "tasks" */
export type Tasks_Mutation_Response = {
  __typename?: 'tasks_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Tasks>;
};

/** on_conflict condition type for table "tasks" */
export type Tasks_On_Conflict = {
  constraint: Tasks_Constraint;
  update_columns?: Array<Tasks_Update_Column>;
  where?: InputMaybe<Tasks_Bool_Exp>;
};

/** Ordering options when selecting data from "tasks". */
export type Tasks_Order_By = {
  completed?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  entity_id?: InputMaybe<Order_By>;
  entity_type?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  task_id?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: tasks */
export type Tasks_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Tasks_Prepend_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "tasks" */
export enum Tasks_Select_Column {
  /** column name */
  Completed = 'completed',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EntityId = 'entity_id',
  /** column name */
  EntityType = 'entity_type',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Status = 'status',
  /** column name */
  TaskId = 'task_id',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "tasks" */
export type Tasks_Set_Input = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  entity_id?: InputMaybe<Scalars['uuid']['input']>;
  entity_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  task_id?: InputMaybe<Scalars['uuid']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "tasks" */
export type Tasks_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Tasks_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Tasks_Stream_Cursor_Value_Input = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  entity_id?: InputMaybe<Scalars['uuid']['input']>;
  entity_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  task_id?: InputMaybe<Scalars['uuid']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "tasks" */
export enum Tasks_Update_Column {
  /** column name */
  Completed = 'completed',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EntityId = 'entity_id',
  /** column name */
  EntityType = 'entity_type',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  Status = 'status',
  /** column name */
  TaskId = 'task_id',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Tasks_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Tasks_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Tasks_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Tasks_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Tasks_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Tasks_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Tasks_Set_Input>;
  /** filter the rows which have to be updated */
  where: Tasks_Bool_Exp;
};

/** This is a workaround when running CLI to dump from Hasura Cloud does not work, so I tried to use CLI run console to connect to db, create this table to make changes to generata migration files */
export type Test = {
  __typename?: 'test';
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
};

/** aggregated selection of "test" */
export type Test_Aggregate = {
  __typename?: 'test_aggregate';
  aggregate?: Maybe<Test_Aggregate_Fields>;
  nodes: Array<Test>;
};

/** aggregate fields of "test" */
export type Test_Aggregate_Fields = {
  __typename?: 'test_aggregate_fields';
  avg?: Maybe<Test_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Test_Max_Fields>;
  min?: Maybe<Test_Min_Fields>;
  stddev?: Maybe<Test_Stddev_Fields>;
  stddev_pop?: Maybe<Test_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Test_Stddev_Samp_Fields>;
  sum?: Maybe<Test_Sum_Fields>;
  var_pop?: Maybe<Test_Var_Pop_Fields>;
  var_samp?: Maybe<Test_Var_Samp_Fields>;
  variance?: Maybe<Test_Variance_Fields>;
};


/** aggregate fields of "test" */
export type Test_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Test_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Test_Avg_Fields = {
  __typename?: 'test_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "test". All fields are combined with a logical 'AND'. */
export type Test_Bool_Exp = {
  _and?: InputMaybe<Array<Test_Bool_Exp>>;
  _not?: InputMaybe<Test_Bool_Exp>;
  _or?: InputMaybe<Array<Test_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "test" */
export enum Test_Constraint {
  /** unique or primary key constraint on columns "id" */
  TestPkey = 'test_pkey'
}

/** input type for incrementing numeric columns in table "test" */
export type Test_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "test" */
export type Test_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Test_Max_Fields = {
  __typename?: 'test_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type Test_Min_Fields = {
  __typename?: 'test_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
};

/** response of any mutation on the table "test" */
export type Test_Mutation_Response = {
  __typename?: 'test_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Test>;
};

/** on_conflict condition type for table "test" */
export type Test_On_Conflict = {
  constraint: Test_Constraint;
  update_columns?: Array<Test_Update_Column>;
  where?: InputMaybe<Test_Bool_Exp>;
};

/** Ordering options when selecting data from "test". */
export type Test_Order_By = {
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: test */
export type Test_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "test" */
export enum Test_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id'
}

/** input type for updating data in table "test" */
export type Test_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Test_Stddev_Fields = {
  __typename?: 'test_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Test_Stddev_Pop_Fields = {
  __typename?: 'test_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Test_Stddev_Samp_Fields = {
  __typename?: 'test_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "test" */
export type Test_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Test_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Test_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Test_Sum_Fields = {
  __typename?: 'test_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "test" */
export enum Test_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id'
}

export type Test_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Test_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Test_Set_Input>;
  /** filter the rows which have to be updated */
  where: Test_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Test_Var_Pop_Fields = {
  __typename?: 'test_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Test_Var_Samp_Fields = {
  __typename?: 'test_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Test_Variance_Fields = {
  __typename?: 'test_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
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
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  last_watched_at: Scalars['timestamptz']['output'];
  progress_seconds: Scalars['Int']['output'];
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
  /** An object relationship */
  video: Videos;
  video_id: Scalars['uuid']['output'];
};

/** aggregated selection of "user_video_history" */
export type User_Video_History_Aggregate = {
  __typename?: 'user_video_history_aggregate';
  aggregate?: Maybe<User_Video_History_Aggregate_Fields>;
  nodes: Array<User_Video_History>;
};

export type User_Video_History_Aggregate_Bool_Exp = {
  count?: InputMaybe<User_Video_History_Aggregate_Bool_Exp_Count>;
};

export type User_Video_History_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Video_History_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Video_History_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_video_history" */
export type User_Video_History_Aggregate_Fields = {
  __typename?: 'user_video_history_aggregate_fields';
  avg?: Maybe<User_Video_History_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Video_History_Max_Fields>;
  min?: Maybe<User_Video_History_Min_Fields>;
  stddev?: Maybe<User_Video_History_Stddev_Fields>;
  stddev_pop?: Maybe<User_Video_History_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Video_History_Stddev_Samp_Fields>;
  sum?: Maybe<User_Video_History_Sum_Fields>;
  var_pop?: Maybe<User_Video_History_Var_Pop_Fields>;
  var_samp?: Maybe<User_Video_History_Var_Samp_Fields>;
  variance?: Maybe<User_Video_History_Variance_Fields>;
};


/** aggregate fields of "user_video_history" */
export type User_Video_History_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Video_History_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
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

/** aggregate avg on columns */
export type User_Video_History_Avg_Fields = {
  __typename?: 'user_video_history_avg_fields';
  progress_seconds?: Maybe<Scalars['Float']['output']>;
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
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  last_watched_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  progress_seconds?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_video_history" */
export enum User_Video_History_Constraint {
  /** unique or primary key constraint on columns "id" */
  UserVideoHistoryPkey = 'user_video_history_pkey',
  /** unique or primary key constraint on columns "user_id", "video_id" */
  UserVideoHistoryUserIdVideoIdKey = 'user_video_history_user_id_video_id_key'
}

/** input type for incrementing numeric columns in table "user_video_history" */
export type User_Video_History_Inc_Input = {
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_video_history" */
export type User_Video_History_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_watched_at?: InputMaybe<Scalars['timestamptz']['input']>;
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type User_Video_History_Max_Fields = {
  __typename?: 'user_video_history_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_watched_at?: Maybe<Scalars['timestamptz']['output']>;
  progress_seconds?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "user_video_history" */
export type User_Video_History_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_watched_at?: InputMaybe<Order_By>;
  progress_seconds?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Video_History_Min_Fields = {
  __typename?: 'user_video_history_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_watched_at?: Maybe<Scalars['timestamptz']['output']>;
  progress_seconds?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "user_video_history" */
export type User_Video_History_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_watched_at?: InputMaybe<Order_By>;
  progress_seconds?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_watched_at?: InputMaybe<Order_By>;
  progress_seconds?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  LastWatchedAt = 'last_watched_at',
  /** column name */
  ProgressSeconds = 'progress_seconds',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VideoId = 'video_id'
}

/** input type for updating data in table "user_video_history" */
export type User_Video_History_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_watched_at?: InputMaybe<Scalars['timestamptz']['input']>;
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type User_Video_History_Stddev_Fields = {
  __typename?: 'user_video_history_stddev_fields';
  progress_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "user_video_history" */
export type User_Video_History_Stddev_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type User_Video_History_Stddev_Pop_Fields = {
  __typename?: 'user_video_history_stddev_pop_fields';
  progress_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "user_video_history" */
export type User_Video_History_Stddev_Pop_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type User_Video_History_Stddev_Samp_Fields = {
  __typename?: 'user_video_history_stddev_samp_fields';
  progress_seconds?: Maybe<Scalars['Float']['output']>;
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
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_watched_at?: InputMaybe<Scalars['timestamptz']['input']>;
  progress_seconds?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type User_Video_History_Sum_Fields = {
  __typename?: 'user_video_history_sum_fields';
  progress_seconds?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "user_video_history" */
export type User_Video_History_Sum_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** update columns of table "user_video_history" */
export enum User_Video_History_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  LastWatchedAt = 'last_watched_at',
  /** column name */
  ProgressSeconds = 'progress_seconds',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VideoId = 'video_id'
}

export type User_Video_History_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Video_History_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Video_History_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Video_History_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Video_History_Var_Pop_Fields = {
  __typename?: 'user_video_history_var_pop_fields';
  progress_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "user_video_history" */
export type User_Video_History_Var_Pop_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type User_Video_History_Var_Samp_Fields = {
  __typename?: 'user_video_history_var_samp_fields';
  progress_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "user_video_history" */
export type User_Video_History_Var_Samp_Order_By = {
  progress_seconds?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type User_Video_History_Variance_Fields = {
  __typename?: 'user_video_history_variance_fields';
  progress_seconds?: Maybe<Scalars['Float']['output']>;
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
  /** An aggregate relationship */
  audios_aggregate: Audios_Aggregate;
  auth0_id: Scalars['String']['output'];
  /** An array relationship */
  crawl_requests: Array<Crawl_Requests>;
  /** An aggregate relationship */
  crawl_requests_aggregate: Crawl_Requests_Aggregate;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  /** An array relationship */
  notifications: Array<Notifications>;
  /** An aggregate relationship */
  notifications_aggregate: Notifications_Aggregate;
  /** An array relationship */
  playlists: Array<Playlist>;
  /** An aggregate relationship */
  playlists_aggregate: Playlist_Aggregate;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An array relationship */
  user_video_histories: Array<User_Video_History>;
  /** An aggregate relationship */
  user_video_histories_aggregate: User_Video_History_Aggregate;
  username?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  video_views: Array<Video_Views>;
  /** An aggregate relationship */
  video_views_aggregate: Video_Views_Aggregate;
  /** An array relationship */
  videos: Array<Videos>;
  /** An aggregate relationship */
  videos_aggregate: Videos_Aggregate;
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
export type UsersAudios_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Audios_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Audios_Order_By>>;
  where?: InputMaybe<Audios_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersCrawl_RequestsArgs = {
  distinct_on?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Crawl_Requests_Order_By>>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersCrawl_Requests_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Crawl_Requests_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Crawl_Requests_Order_By>>;
  where?: InputMaybe<Crawl_Requests_Bool_Exp>;
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
export type UsersNotifications_AggregateArgs = {
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
export type UsersPlaylists_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Playlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Playlist_Order_By>>;
  where?: InputMaybe<Playlist_Bool_Exp>;
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
export type UsersUser_Video_Histories_AggregateArgs = {
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


/** columns and relationships of "users" */
export type UsersVideos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Videos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Videos_Order_By>>;
  where?: InputMaybe<Videos_Bool_Exp>;
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  audios?: InputMaybe<Audios_Bool_Exp>;
  audios_aggregate?: InputMaybe<Audios_Aggregate_Bool_Exp>;
  auth0_id?: InputMaybe<String_Comparison_Exp>;
  crawl_requests?: InputMaybe<Crawl_Requests_Bool_Exp>;
  crawl_requests_aggregate?: InputMaybe<Crawl_Requests_Aggregate_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  notifications?: InputMaybe<Notifications_Bool_Exp>;
  notifications_aggregate?: InputMaybe<Notifications_Aggregate_Bool_Exp>;
  playlists?: InputMaybe<Playlist_Bool_Exp>;
  playlists_aggregate?: InputMaybe<Playlist_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_video_histories?: InputMaybe<User_Video_History_Bool_Exp>;
  user_video_histories_aggregate?: InputMaybe<User_Video_History_Aggregate_Bool_Exp>;
  username?: InputMaybe<String_Comparison_Exp>;
  video_views?: InputMaybe<Video_Views_Bool_Exp>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Bool_Exp>;
  videos?: InputMaybe<Videos_Bool_Exp>;
  videos_aggregate?: InputMaybe<Videos_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "auth0_id" */
  UsersAuth0IdKey = 'users_auth0_id_key',
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey',
  /** unique or primary key constraint on columns "username" */
  UsersUsernameKey = 'users_username_key'
}

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  audios?: InputMaybe<Audios_Arr_Rel_Insert_Input>;
  auth0_id?: InputMaybe<Scalars['String']['input']>;
  crawl_requests?: InputMaybe<Crawl_Requests_Arr_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  notifications?: InputMaybe<Notifications_Arr_Rel_Insert_Input>;
  playlists?: InputMaybe<Playlist_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_video_histories?: InputMaybe<User_Video_History_Arr_Rel_Insert_Input>;
  username?: InputMaybe<Scalars['String']['input']>;
  video_views?: InputMaybe<Video_Views_Arr_Rel_Insert_Input>;
  videos?: InputMaybe<Videos_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  auth0_id?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  auth0_id?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  audios_aggregate?: InputMaybe<Audios_Aggregate_Order_By>;
  auth0_id?: InputMaybe<Order_By>;
  crawl_requests_aggregate?: InputMaybe<Crawl_Requests_Aggregate_Order_By>;
  created_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  notifications_aggregate?: InputMaybe<Notifications_Aggregate_Order_By>;
  playlists_aggregate?: InputMaybe<Playlist_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_video_histories_aggregate?: InputMaybe<User_Video_History_Aggregate_Order_By>;
  username?: InputMaybe<Order_By>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Order_By>;
  videos_aggregate?: InputMaybe<Videos_Aggregate_Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  Auth0Id = 'auth0_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Username = 'username'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  auth0_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  auth0_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  Auth0Id = 'auth0_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Username = 'username'
}

export type Users_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
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
  created_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  tag: Tags;
  tag_id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  video: Videos;
  video_id: Scalars['uuid']['output'];
};

/** aggregated selection of "video_tags" */
export type Video_Tags_Aggregate = {
  __typename?: 'video_tags_aggregate';
  aggregate?: Maybe<Video_Tags_Aggregate_Fields>;
  nodes: Array<Video_Tags>;
};

export type Video_Tags_Aggregate_Bool_Exp = {
  count?: InputMaybe<Video_Tags_Aggregate_Bool_Exp_Count>;
};

export type Video_Tags_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Video_Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Video_Tags_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "video_tags" */
export type Video_Tags_Aggregate_Fields = {
  __typename?: 'video_tags_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Video_Tags_Max_Fields>;
  min?: Maybe<Video_Tags_Min_Fields>;
};


/** aggregate fields of "video_tags" */
export type Video_Tags_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Video_Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "video_tags" */
export type Video_Tags_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Video_Tags_Max_Order_By>;
  min?: InputMaybe<Video_Tags_Min_Order_By>;
};

/** input type for inserting array relation for remote table "video_tags" */
export type Video_Tags_Arr_Rel_Insert_Input = {
  data: Array<Video_Tags_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Video_Tags_On_Conflict>;
};

/** Boolean expression to filter rows from the table "video_tags". All fields are combined with a logical 'AND'. */
export type Video_Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Video_Tags_Bool_Exp>>;
  _not?: InputMaybe<Video_Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Video_Tags_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  tag?: InputMaybe<Tags_Bool_Exp>;
  tag_id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "video_tags" */
export enum Video_Tags_Constraint {
  /** unique or primary key constraint on columns "video_id", "tag_id" */
  VideoTagsPkey = 'video_tags_pkey'
}

/** input type for inserting data into table "video_tags" */
export type Video_Tags_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  tag?: InputMaybe<Tags_Obj_Rel_Insert_Input>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Video_Tags_Max_Fields = {
  __typename?: 'video_tags_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  tag_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "video_tags" */
export type Video_Tags_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Video_Tags_Min_Fields = {
  __typename?: 'video_tags_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  tag_id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "video_tags" */
export type Video_Tags_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "video_tags" */
export type Video_Tags_Mutation_Response = {
  __typename?: 'video_tags_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Video_Tags>;
};

/** on_conflict condition type for table "video_tags" */
export type Video_Tags_On_Conflict = {
  constraint: Video_Tags_Constraint;
  update_columns?: Array<Video_Tags_Update_Column>;
  where?: InputMaybe<Video_Tags_Bool_Exp>;
};

/** Ordering options when selecting data from "video_tags". */
export type Video_Tags_Order_By = {
  created_at?: InputMaybe<Order_By>;
  tag?: InputMaybe<Tags_Order_By>;
  tag_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
  video_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: video_tags */
export type Video_Tags_Pk_Columns_Input = {
  tag_id: Scalars['uuid']['input'];
  video_id: Scalars['uuid']['input'];
};

/** select columns of table "video_tags" */
export enum Video_Tags_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  TagId = 'tag_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VideoId = 'video_id'
}

/** input type for updating data in table "video_tags" */
export type Video_Tags_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "video_tags" */
export type Video_Tags_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Video_Tags_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Video_Tags_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "video_tags" */
export enum Video_Tags_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  TagId = 'tag_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VideoId = 'video_id'
}

export type Video_Tags_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Video_Tags_Set_Input>;
  /** filter the rows which have to be updated */
  where: Video_Tags_Bool_Exp;
};

/** columns and relationships of "video_views" */
export type Video_Views = {
  __typename?: 'video_views';
  id: Scalars['uuid']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
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
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  video?: InputMaybe<Videos_Bool_Exp>;
  video_id?: InputMaybe<Uuid_Comparison_Exp>;
  viewed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "video_views" */
export enum Video_Views_Constraint {
  /** unique or primary key constraint on columns "id" */
  VideoViewsPkey = 'video_views_pkey'
}

/** input type for inserting data into table "video_views" */
export type Video_Views_Insert_Input = {
  id?: InputMaybe<Scalars['uuid']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video?: InputMaybe<Videos_Obj_Rel_Insert_Input>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
  viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Video_Views_Max_Fields = {
  __typename?: 'video_views_max_fields';
  id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
  viewed_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "video_views" */
export type Video_Views_Max_Order_By = {
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  video_id?: InputMaybe<Order_By>;
  viewed_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Video_Views_Min_Fields = {
  __typename?: 'video_views_min_fields';
  id?: Maybe<Scalars['uuid']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_id?: Maybe<Scalars['uuid']['output']>;
  viewed_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "video_views" */
export type Video_Views_Min_Order_By = {
  id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
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
  user_id?: InputMaybe<Order_By>;
  video?: InputMaybe<Videos_Order_By>;
  video_id?: InputMaybe<Order_By>;
  viewed_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: video_views */
export type Video_Views_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "video_views" */
export enum Video_Views_Select_Column {
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VideoId = 'video_id',
  /** column name */
  ViewedAt = 'viewed_at'
}

/** input type for updating data in table "video_views" */
export type Video_Views_Set_Input = {
  id?: InputMaybe<Scalars['uuid']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
  viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

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
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_id?: InputMaybe<Scalars['uuid']['input']>;
  viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "video_views" */
export enum Video_Views_Update_Column {
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VideoId = 'video_id',
  /** column name */
  ViewedAt = 'viewed_at'
}

export type Video_Views_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Video_Views_Set_Input>;
  /** filter the rows which have to be updated */
  where: Video_Views_Bool_Exp;
};

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
  public: Scalars['Boolean']['output'];
  /** short id like Youtube video id */
  sId?: Maybe<Scalars['String']['output']>;
  /** When this field is true, do not convert, import hls, do nothing, just keep the video status as is */
  skip_process: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  subtitles: Array<Subtitles>;
  /** An aggregate relationship */
  subtitles_aggregate: Subtitles_Aggregate;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
  /** An array relationship */
  user_video_histories: Array<User_Video_History>;
  /** An aggregate relationship */
  user_video_histories_aggregate: User_Video_History_Aggregate;
  /** An array relationship */
  video_tags: Array<Video_Tags>;
  /** An aggregate relationship */
  video_tags_aggregate: Video_Tags_Aggregate;
  video_url: Scalars['String']['output'];
  /** An array relationship */
  video_views: Array<Video_Views>;
  /** An aggregate relationship */
  video_views_aggregate: Video_Views_Aggregate;
  view_count?: Maybe<Scalars['Int']['output']>;
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
export type VideosSubtitles_AggregateArgs = {
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
export type VideosUser_Video_Histories_AggregateArgs = {
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
export type VideosVideo_Tags_AggregateArgs = {
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

/** aggregated selection of "videos" */
export type Videos_Aggregate = {
  __typename?: 'videos_aggregate';
  aggregate?: Maybe<Videos_Aggregate_Fields>;
  nodes: Array<Videos>;
};

export type Videos_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Videos_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Videos_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Videos_Aggregate_Bool_Exp_Count>;
};

export type Videos_Aggregate_Bool_Exp_Bool_And = {
  arguments: Videos_Select_Column_Videos_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Videos_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Videos_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Videos_Select_Column_Videos_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Videos_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Videos_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Videos_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Videos_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "videos" */
export type Videos_Aggregate_Fields = {
  __typename?: 'videos_aggregate_fields';
  avg?: Maybe<Videos_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Videos_Max_Fields>;
  min?: Maybe<Videos_Min_Fields>;
  stddev?: Maybe<Videos_Stddev_Fields>;
  stddev_pop?: Maybe<Videos_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Videos_Stddev_Samp_Fields>;
  sum?: Maybe<Videos_Sum_Fields>;
  var_pop?: Maybe<Videos_Var_Pop_Fields>;
  var_samp?: Maybe<Videos_Var_Samp_Fields>;
  variance?: Maybe<Videos_Variance_Fields>;
};


/** aggregate fields of "videos" */
export type Videos_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Videos_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
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

/** input type for inserting array relation for remote table "videos" */
export type Videos_Arr_Rel_Insert_Input = {
  data: Array<Videos_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Videos_On_Conflict>;
};

/** aggregate avg on columns */
export type Videos_Avg_Fields = {
  __typename?: 'videos_avg_fields';
  duration?: Maybe<Scalars['Float']['output']>;
  view_count?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "videos" */
export type Videos_Avg_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
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
  public?: InputMaybe<Boolean_Comparison_Exp>;
  sId?: InputMaybe<String_Comparison_Exp>;
  skip_process?: InputMaybe<Boolean_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  subtitles?: InputMaybe<Subtitles_Bool_Exp>;
  subtitles_aggregate?: InputMaybe<Subtitles_Aggregate_Bool_Exp>;
  thumbnailUrl?: InputMaybe<String_Comparison_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  user_video_histories?: InputMaybe<User_Video_History_Bool_Exp>;
  user_video_histories_aggregate?: InputMaybe<User_Video_History_Aggregate_Bool_Exp>;
  video_tags?: InputMaybe<Video_Tags_Bool_Exp>;
  video_tags_aggregate?: InputMaybe<Video_Tags_Aggregate_Bool_Exp>;
  video_url?: InputMaybe<String_Comparison_Exp>;
  video_views?: InputMaybe<Video_Views_Bool_Exp>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Bool_Exp>;
  view_count?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "videos" */
export enum Videos_Constraint {
  /** unique or primary key constraint on columns "id" */
  VideosPkey = 'videos_pkey',
  /** unique or primary key constraint on columns "s_id" */
  VideosSIdKey = 'videos_s_id_key',
  /** unique or primary key constraint on columns "slug" */
  VideosSlugUnique = 'videos_slug_unique'
}

/** input type for incrementing numeric columns in table "videos" */
export type Videos_Inc_Input = {
  duration?: InputMaybe<Scalars['Int']['input']>;
  view_count?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "videos" */
export type Videos_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  playlist_videos?: InputMaybe<Playlist_Videos_Arr_Rel_Insert_Input>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** short id like Youtube video id */
  sId?: InputMaybe<Scalars['String']['input']>;
  /** When this field is true, do not convert, import hls, do nothing, just keep the video status as is */
  skip_process?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtitles?: InputMaybe<Subtitles_Arr_Rel_Insert_Input>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  user_video_histories?: InputMaybe<User_Video_History_Arr_Rel_Insert_Input>;
  video_tags?: InputMaybe<Video_Tags_Arr_Rel_Insert_Input>;
  video_url?: InputMaybe<Scalars['String']['input']>;
  video_views?: InputMaybe<Video_Views_Arr_Rel_Insert_Input>;
  view_count?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Videos_Max_Fields = {
  __typename?: 'videos_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** short id like Youtube video id */
  sId?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_url?: Maybe<Scalars['String']['output']>;
  view_count?: Maybe<Scalars['Int']['output']>;
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
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  video_url?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Videos_Min_Fields = {
  __typename?: 'videos_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** short id like Youtube video id */
  sId?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  video_url?: Maybe<Scalars['String']['output']>;
  view_count?: Maybe<Scalars['Int']['output']>;
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
  updatedAt?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  video_url?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
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
  public?: InputMaybe<Order_By>;
  sId?: InputMaybe<Order_By>;
  skip_process?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subtitles_aggregate?: InputMaybe<Subtitles_Aggregate_Order_By>;
  thumbnailUrl?: InputMaybe<Order_By>;
  title?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  user_video_histories_aggregate?: InputMaybe<User_Video_History_Aggregate_Order_By>;
  video_tags_aggregate?: InputMaybe<Video_Tags_Aggregate_Order_By>;
  video_url?: InputMaybe<Order_By>;
  video_views_aggregate?: InputMaybe<Video_Views_Aggregate_Order_By>;
  view_count?: InputMaybe<Order_By>;
};

/** primary key columns input for table: videos */
export type Videos_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
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
  Public = 'public',
  /** column name */
  SId = 'sId',
  /** column name */
  SkipProcess = 'skip_process',
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
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VideoUrl = 'video_url',
  /** column name */
  ViewCount = 'view_count'
}

/** select "videos_aggregate_bool_exp_bool_and_arguments_columns" columns of table "videos" */
export enum Videos_Select_Column_Videos_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Public = 'public',
  /** column name */
  SkipProcess = 'skip_process'
}

/** select "videos_aggregate_bool_exp_bool_or_arguments_columns" columns of table "videos" */
export enum Videos_Select_Column_Videos_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Public = 'public',
  /** column name */
  SkipProcess = 'skip_process'
}

/** input type for updating data in table "videos" */
export type Videos_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** short id like Youtube video id */
  sId?: InputMaybe<Scalars['String']['input']>;
  /** When this field is true, do not convert, import hls, do nothing, just keep the video status as is */
  skip_process?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_url?: InputMaybe<Scalars['String']['input']>;
  view_count?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Videos_Stddev_Fields = {
  __typename?: 'videos_stddev_fields';
  duration?: Maybe<Scalars['Float']['output']>;
  view_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "videos" */
export type Videos_Stddev_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Videos_Stddev_Pop_Fields = {
  __typename?: 'videos_stddev_pop_fields';
  duration?: Maybe<Scalars['Float']['output']>;
  view_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "videos" */
export type Videos_Stddev_Pop_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Videos_Stddev_Samp_Fields = {
  __typename?: 'videos_stddev_samp_fields';
  duration?: Maybe<Scalars['Float']['output']>;
  view_count?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "videos" */
export type Videos_Stddev_Samp_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
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
  public?: InputMaybe<Scalars['Boolean']['input']>;
  /** short id like Youtube video id */
  sId?: InputMaybe<Scalars['String']['input']>;
  /** When this field is true, do not convert, import hls, do nothing, just keep the video status as is */
  skip_process?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  video_url?: InputMaybe<Scalars['String']['input']>;
  view_count?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Videos_Sum_Fields = {
  __typename?: 'videos_sum_fields';
  duration?: Maybe<Scalars['Int']['output']>;
  view_count?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "videos" */
export type Videos_Sum_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
};

/** update columns of table "videos" */
export enum Videos_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Description = 'description',
  /** column name */
  Duration = 'duration',
  /** column name */
  Id = 'id',
  /** column name */
  Public = 'public',
  /** column name */
  SId = 'sId',
  /** column name */
  SkipProcess = 'skip_process',
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
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VideoUrl = 'video_url',
  /** column name */
  ViewCount = 'view_count'
}

export type Videos_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Videos_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Videos_Set_Input>;
  /** filter the rows which have to be updated */
  where: Videos_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Videos_Var_Pop_Fields = {
  __typename?: 'videos_var_pop_fields';
  duration?: Maybe<Scalars['Float']['output']>;
  view_count?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "videos" */
export type Videos_Var_Pop_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Videos_Var_Samp_Fields = {
  __typename?: 'videos_var_samp_fields';
  duration?: Maybe<Scalars['Float']['output']>;
  view_count?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "videos" */
export type Videos_Var_Samp_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Videos_Variance_Fields = {
  __typename?: 'videos_variance_fields';
  duration?: Maybe<Scalars['Float']['output']>;
  view_count?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "videos" */
export type Videos_Variance_Order_By = {
  duration?: InputMaybe<Order_By>;
  view_count?: InputMaybe<Order_By>;
};

export type CreateFinanceRecordMutationVariables = Exact<{
  object: Finance_Transactions_Insert_Input;
}>;


export type CreateFinanceRecordMutation = { __typename?: 'mutation_root', insert_finance_transactions_one?: { __typename?: 'finance_transactions', id: any, name: string, amount: any, month: number, year: number, category: string, createdAt: any } | null };

export type UpdateFinanceRecordMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  object: Finance_Transactions_Set_Input;
}>;


export type UpdateFinanceRecordMutation = { __typename?: 'mutation_root', update_finance_transactions_by_pk?: { __typename?: 'finance_transactions', id: any, name: string, amount: any, month: number, year: number, category: string, updatedAt: any } | null };

export type DeleteFinanceRecordMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteFinanceRecordMutation = { __typename?: 'mutation_root', delete_finance_transactions_by_pk?: { __typename?: 'finance_transactions', id: any } | null };

export type GetFinanceRecordsQueryVariables = Exact<{
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type GetFinanceRecordsQuery = { __typename?: 'query_root', finance_transactions: Array<{ __typename?: 'finance_transactions', id: any, name: string, amount: any, month: number, year: number, category: string, createdAt: any, updatedAt: any }>, must_aggregate: { __typename?: 'finance_transactions_aggregate', aggregate?: { __typename?: 'finance_transactions_aggregate_fields', count: number, sum?: { __typename?: 'finance_transactions_sum_fields', amount?: any | null } | null } | null }, nice_aggregate: { __typename?: 'finance_transactions_aggregate', aggregate?: { __typename?: 'finance_transactions_aggregate_fields', count: number, sum?: { __typename?: 'finance_transactions_sum_fields', amount?: any | null } | null } | null }, waste_aggregate: { __typename?: 'finance_transactions_aggregate', aggregate?: { __typename?: 'finance_transactions_aggregate_fields', count: number, sum?: { __typename?: 'finance_transactions_sum_fields', amount?: any | null } | null } | null }, oldest_aggregate: Array<{ __typename?: 'finance_transactions', year: number, month: number }> };

export type GetMonthlyComparisonQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMonthlyComparisonQuery = { __typename?: 'query_root', monthly_totals: { __typename?: 'finance_transactions_aggregate', nodes: Array<{ __typename?: 'finance_transactions', month: number, year: number }>, aggregate?: { __typename?: 'finance_transactions_aggregate_fields', count: number, sum?: { __typename?: 'finance_transactions_sum_fields', amount?: any | null } | null } | null } };

export type CreateJournalMutationVariables = Exact<{
  object: Journals_Insert_Input;
}>;


export type CreateJournalMutation = { __typename?: 'mutation_root', insert_journals_one?: { __typename?: 'journals', id: any, date: any, content: string, mood: string, tags: any, createdAt: any, updatedAt: any } | null };

export type UpdateJournalMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  set: Journals_Set_Input;
}>;


export type UpdateJournalMutation = { __typename?: 'mutation_root', update_journals_by_pk?: { __typename?: 'journals', id: any, date: any, content: string, mood: string, tags: any, updatedAt: any } | null };

export type DeleteJournalMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type DeleteJournalMutation = { __typename?: 'mutation_root', delete_journals_by_pk?: { __typename?: 'journals', id: any } | null };

export type GetJournalsByMonthQueryVariables = Exact<{
  startDate: Scalars['date']['input'];
  endDate: Scalars['date']['input'];
}>;


export type GetJournalsByMonthQuery = { __typename?: 'query_root', journals: Array<{ __typename?: 'journals', id: any, user_id: any, date: any, content: string, mood: string, tags: any, createdAt: any, updatedAt: any }>, happy_aggregate: { __typename?: 'journals_aggregate', aggregate?: { __typename?: 'journals_aggregate_fields', count: number } | null }, neutral_aggregate: { __typename?: 'journals_aggregate', aggregate?: { __typename?: 'journals_aggregate_fields', count: number } | null }, sad_aggregate: { __typename?: 'journals_aggregate', aggregate?: { __typename?: 'journals_aggregate_fields', count: number } | null }, oldest_aggregate: Array<{ __typename?: 'journals', date: any }> };

export type GetJournalByIdQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetJournalByIdQuery = { __typename?: 'query_root', journals_by_pk?: { __typename?: 'journals', id: any, user_id: any, date: any, content: string, mood: string, tags: any, createdAt: any, updatedAt: any } | null };

export type GetAudiosAndFeelingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAudiosAndFeelingsQuery = { __typename?: 'query_root', audios: Array<{ __typename?: 'audios', id: any, name: string, source: string, thumbnailUrl?: string | null, public: boolean, artistName: string, createdAt: any, audio_tags: Array<{ __typename?: 'audio_tags', tag_id: any }> }>, tags: Array<{ __typename?: 'tags', id: any, name: string }> };

export type GetPublicAudiosAndFeelingsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPublicAudiosAndFeelingsQuery = { __typename?: 'query_root', audios: Array<{ __typename?: 'audios', id: any, name: string, source: string, thumbnailUrl?: string | null, artistName: string, audio_tags: Array<{ __typename?: 'audio_tags', tag_id: any }> }>, tags: Array<{ __typename?: 'tags', id: any, name: string }> };

export type PostQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type PostQuery = { __typename?: 'query_root', posts_by_pk?: { __typename?: 'posts', title: string, readTimeInMinutes: number, markdownContent: string, id: any, brief: string, slug: string } | null };

export type AllPostsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllPostsQuery = { __typename?: 'query_root', posts: Array<{ __typename?: 'posts', brief: string, id: any, markdownContent: string, readTimeInMinutes: number, title: string, slug: string }> };

export type FeatureFlagsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type FeatureFlagsSubscription = { __typename?: 'subscription_root', feature_flag: Array<{ __typename?: 'feature_flag', id: any, name: string, conditions?: any | null }> };

export type MarkNotificationAsReadMutationVariables = Exact<{
  notificationId: Scalars['uuid']['input'];
}>;


export type MarkNotificationAsReadMutation = { __typename?: 'mutation_root', update_notifications_by_pk?: { __typename?: 'notifications', id: any, readAt?: any | null } | null };

export type MarkNotificationsAsReadMutationVariables = Exact<{
  ids: Array<Scalars['uuid']['input']> | Scalars['uuid']['input'];
}>;


export type MarkNotificationsAsReadMutation = { __typename?: 'mutation_root', update_notifications?: { __typename?: 'notifications_mutation_response', affected_rows: number, returning: Array<{ __typename?: 'notifications', id: any, readAt?: any | null }> } | null };

export type NotificationsSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NotificationsSubscription = { __typename?: 'subscription_root', notifications: Array<{ __typename?: 'notifications', id: any, entityId: any, entityType: string, type: string, readAt?: any | null, link?: string | null, metadata?: any | null, video?: { __typename?: 'videos', id: any, title: string } | null }> };

export type InsertVideosMutationVariables = Exact<{
  objects: Array<Videos_Insert_Input> | Videos_Insert_Input;
}>;


export type InsertVideosMutation = { __typename?: 'mutation_root', insert_videos?: { __typename?: 'videos_mutation_response', returning: Array<{ __typename?: 'videos', id: any, title: string, description?: string | null }> } | null };

export type UpdateVideoProgressMutationVariables = Exact<{
  videoId: Scalars['uuid']['input'];
  progressSeconds: Scalars['Int']['input'];
  lastWatchedAt: Scalars['timestamptz']['input'];
}>;


export type UpdateVideoProgressMutation = { __typename?: 'mutation_root', insert_user_video_history_one?: { __typename?: 'user_video_history', id: any, progress_seconds: number, last_watched_at: any } | null };

export type UserFieldsFragment = { __typename?: 'users', username?: string | null } & { ' $fragmentName'?: 'UserFieldsFragment' };

export type VideoFieldsFragment = { __typename?: 'videos', id: any, title: string, description?: string | null, duration?: number | null, thumbnailUrl?: string | null, source?: string | null, slug: string, createdAt?: any | null, user: (
    { __typename?: 'users' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ), user_video_histories: Array<{ __typename?: 'user_video_history', last_watched_at: any, progress_seconds: number }>, subtitles: Array<{ __typename?: 'subtitles', id: any, isDefault: boolean, lang: string, url: string }> } & { ' $fragmentName'?: 'VideoFieldsFragment' };

export type PlaylistVideoFieldsFragment = { __typename?: 'playlist_videos', position: number, video: (
    { __typename?: 'videos' }
    & { ' $fragmentRefs'?: { 'VideoFieldsFragment': VideoFieldsFragment } }
  ) } & { ' $fragmentName'?: 'PlaylistVideoFieldsFragment' };

export type PlaylistFieldsFragment = { __typename?: 'playlist', id: any, title: string, thumbnailUrl?: string | null, slug: string, createdAt: any, description?: string | null, user: (
    { __typename?: 'users' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ), playlist_videos: Array<(
    { __typename?: 'playlist_videos' }
    & { ' $fragmentRefs'?: { 'PlaylistVideoFieldsFragment': PlaylistVideoFieldsFragment } }
  )> } & { ' $fragmentName'?: 'PlaylistFieldsFragment' };

export type UserVideoHistoryQueryVariables = Exact<{ [key: string]: never; }>;


export type UserVideoHistoryQuery = { __typename?: 'query_root', user_video_history: Array<{ __typename?: 'user_video_history', id: any, last_watched_at: any, progress_seconds: number, video: { __typename?: 'videos', id: any, title: string, source?: string | null, slug: string, thumbnailUrl?: string | null, duration?: number | null, createdAt?: any | null, user: (
        { __typename?: 'users' }
        & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
      ), playlist_videos: Array<{ __typename?: 'playlist_videos', playlist: { __typename?: 'playlist', id: any, slug: string, title: string, thumbnailUrl?: string | null } }> } }> };

export type PlaylistDetailQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type PlaylistDetailQuery = { __typename?: 'query_root', playlist_by_pk?: (
    { __typename?: 'playlist' }
    & { ' $fragmentRefs'?: { 'PlaylistFieldsFragment': PlaylistFieldsFragment } }
  ) | null };

export type PlaylistsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlaylistsQuery = { __typename?: 'query_root', playlist: Array<{ __typename?: 'playlist', title: string, id: any, slug: string }> };

export type VideoDetailQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type VideoDetailQuery = { __typename?: 'query_root', videos: Array<(
    { __typename?: 'videos' }
    & { ' $fragmentRefs'?: { 'VideoFieldsFragment': VideoFieldsFragment } }
  )>, videos_by_pk?: { __typename?: 'videos', id: any, source?: string | null, thumbnailUrl?: string | null, title: string, description?: string | null } | null };

export type AllVideosQueryVariables = Exact<{ [key: string]: never; }>;


export type AllVideosQuery = { __typename?: 'query_root', videos: Array<(
    { __typename?: 'videos' }
    & { ' $fragmentRefs'?: { 'VideoFieldsFragment': VideoFieldsFragment } }
  )>, playlist: Array<(
    { __typename?: 'playlist' }
    & { ' $fragmentRefs'?: { 'PlaylistFieldsFragment': PlaylistFieldsFragment } }
  )> };

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
export const UserFieldsFragmentDoc = new TypedDocumentString(`
    fragment UserFields on users {
  username
}
    `, {"fragmentName":"UserFields"}) as unknown as TypedDocumentString<UserFieldsFragment, unknown>;
export const VideoFieldsFragmentDoc = new TypedDocumentString(`
    fragment VideoFields on videos {
  id
  title
  description
  duration
  thumbnailUrl
  source
  slug
  createdAt
  user {
    ...UserFields
  }
  user_video_histories {
    last_watched_at
    progress_seconds
  }
  subtitles {
    id
    isDefault
    lang
    url
  }
}
    fragment UserFields on users {
  username
}`, {"fragmentName":"VideoFields"}) as unknown as TypedDocumentString<VideoFieldsFragment, unknown>;
export const PlaylistVideoFieldsFragmentDoc = new TypedDocumentString(`
    fragment PlaylistVideoFields on playlist_videos {
  position
  video {
    ...VideoFields
  }
}
    fragment UserFields on users {
  username
}
fragment VideoFields on videos {
  id
  title
  description
  duration
  thumbnailUrl
  source
  slug
  createdAt
  user {
    ...UserFields
  }
  user_video_histories {
    last_watched_at
    progress_seconds
  }
  subtitles {
    id
    isDefault
    lang
    url
  }
}`, {"fragmentName":"PlaylistVideoFields"}) as unknown as TypedDocumentString<PlaylistVideoFieldsFragment, unknown>;
export const PlaylistFieldsFragmentDoc = new TypedDocumentString(`
    fragment PlaylistFields on playlist {
  id
  title
  thumbnailUrl
  slug
  createdAt
  description
  user {
    ...UserFields
  }
  playlist_videos(
    where: {video: {status: {_eq: "ready"}}}
    order_by: {position: asc}
  ) {
    ...PlaylistVideoFields
  }
}
    fragment UserFields on users {
  username
}
fragment VideoFields on videos {
  id
  title
  description
  duration
  thumbnailUrl
  source
  slug
  createdAt
  user {
    ...UserFields
  }
  user_video_histories {
    last_watched_at
    progress_seconds
  }
  subtitles {
    id
    isDefault
    lang
    url
  }
}
fragment PlaylistVideoFields on playlist_videos {
  position
  video {
    ...VideoFields
  }
}`, {"fragmentName":"PlaylistFields"}) as unknown as TypedDocumentString<PlaylistFieldsFragment, unknown>;
export const CreateFinanceRecordDocument = new TypedDocumentString(`
    mutation CreateFinanceRecord($object: finance_transactions_insert_input!) {
  insert_finance_transactions_one(object: $object) {
    id
    name
    amount
    month
    year
    category
    createdAt
  }
}
    `) as unknown as TypedDocumentString<CreateFinanceRecordMutation, CreateFinanceRecordMutationVariables>;
export const UpdateFinanceRecordDocument = new TypedDocumentString(`
    mutation UpdateFinanceRecord($id: uuid!, $object: finance_transactions_set_input!) {
  update_finance_transactions_by_pk(pk_columns: {id: $id}, _set: $object) {
    id
    name
    amount
    month
    year
    category
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateFinanceRecordMutation, UpdateFinanceRecordMutationVariables>;
export const DeleteFinanceRecordDocument = new TypedDocumentString(`
    mutation DeleteFinanceRecord($id: uuid!) {
  delete_finance_transactions_by_pk(id: $id) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteFinanceRecordMutation, DeleteFinanceRecordMutationVariables>;
export const GetFinanceRecordsDocument = new TypedDocumentString(`
    query GetFinanceRecords($month: Int!, $year: Int!) {
  finance_transactions(
    where: {month: {_eq: $month}, year: {_eq: $year}}
    order_by: {createdAt: desc}
  ) {
    id
    name
    amount
    month
    year
    category
    createdAt
    updatedAt
  }
  must_aggregate: finance_transactions_aggregate(
    where: {month: {_eq: $month}, year: {_eq: $year}, category: {_eq: "must"}}
  ) {
    aggregate {
      count
      sum {
        amount
      }
    }
  }
  nice_aggregate: finance_transactions_aggregate(
    where: {month: {_eq: $month}, year: {_eq: $year}, category: {_eq: "nice"}}
  ) {
    aggregate {
      count
      sum {
        amount
      }
    }
  }
  waste_aggregate: finance_transactions_aggregate(
    where: {month: {_eq: $month}, year: {_eq: $year}, category: {_eq: "waste"}}
  ) {
    aggregate {
      count
      sum {
        amount
      }
    }
  }
  oldest_aggregate: finance_transactions(
    order_by: {year: asc, month: asc}
    limit: 1
  ) {
    year
    month
  }
}
    `) as unknown as TypedDocumentString<GetFinanceRecordsQuery, GetFinanceRecordsQueryVariables>;
export const GetMonthlyComparisonDocument = new TypedDocumentString(`
    query GetMonthlyComparison {
  monthly_totals: finance_transactions_aggregate(
    order_by: {year: desc, month: desc}
  ) {
    nodes {
      month
      year
    }
    aggregate {
      sum {
        amount
      }
      count
    }
  }
}
    `) as unknown as TypedDocumentString<GetMonthlyComparisonQuery, GetMonthlyComparisonQueryVariables>;
export const CreateJournalDocument = new TypedDocumentString(`
    mutation CreateJournal($object: journals_insert_input!) {
  insert_journals_one(object: $object) {
    id
    date
    content
    mood
    tags
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<CreateJournalMutation, CreateJournalMutationVariables>;
export const UpdateJournalDocument = new TypedDocumentString(`
    mutation UpdateJournal($id: uuid!, $set: journals_set_input!) {
  update_journals_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    date
    content
    mood
    tags
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateJournalMutation, UpdateJournalMutationVariables>;
export const DeleteJournalDocument = new TypedDocumentString(`
    mutation DeleteJournal($id: uuid!) {
  delete_journals_by_pk(id: $id) {
    id
  }
}
    `) as unknown as TypedDocumentString<DeleteJournalMutation, DeleteJournalMutationVariables>;
export const GetJournalsByMonthDocument = new TypedDocumentString(`
    query GetJournalsByMonth($startDate: date!, $endDate: date!) {
  journals(
    where: {date: {_gte: $startDate, _lte: $endDate}}
    order_by: {date: desc, createdAt: desc}
  ) {
    id
    user_id
    date
    content
    mood
    tags
    createdAt
    updatedAt
  }
  happy_aggregate: journals_aggregate(
    where: {date: {_gte: $startDate, _lte: $endDate}, mood: {_eq: "happy"}}
  ) {
    aggregate {
      count
    }
  }
  neutral_aggregate: journals_aggregate(
    where: {date: {_gte: $startDate, _lte: $endDate}, mood: {_eq: "neutral"}}
  ) {
    aggregate {
      count
    }
  }
  sad_aggregate: journals_aggregate(
    where: {date: {_gte: $startDate, _lte: $endDate}, mood: {_eq: "sad"}}
  ) {
    aggregate {
      count
    }
  }
  oldest_aggregate: journals(order_by: {date: asc}, limit: 1) {
    date
  }
}
    `) as unknown as TypedDocumentString<GetJournalsByMonthQuery, GetJournalsByMonthQueryVariables>;
export const GetJournalByIdDocument = new TypedDocumentString(`
    query GetJournalById($id: uuid!) {
  journals_by_pk(id: $id) {
    id
    user_id
    date
    content
    mood
    tags
    createdAt
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<GetJournalByIdQuery, GetJournalByIdQueryVariables>;
export const GetAudiosAndFeelingsDocument = new TypedDocumentString(`
    query GetAudiosAndFeelings @cached {
  audios {
    id
    name
    source
    thumbnailUrl
    public
    artistName
    createdAt
    audio_tags {
      tag_id
    }
  }
  tags(where: {site: {_eq: "listen"}}) {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<GetAudiosAndFeelingsQuery, GetAudiosAndFeelingsQueryVariables>;
export const GetPublicAudiosAndFeelingsDocument = new TypedDocumentString(`
    query GetPublicAudiosAndFeelings @cached {
  audios(where: {public: {_eq: true}}) {
    id
    name
    source
    thumbnailUrl
    artistName
    audio_tags {
      tag_id
    }
  }
  tags(where: {site: {_eq: "listen"}, audio_tags: {audio: {public: {_eq: true}}}}) {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<GetPublicAudiosAndFeelingsQuery, GetPublicAudiosAndFeelingsQueryVariables>;
export const PostDocument = new TypedDocumentString(`
    query Post($id: uuid!) @cached {
  posts_by_pk(id: $id) {
    title
    readTimeInMinutes
    markdownContent
    id
    brief
    slug
  }
}
    `) as unknown as TypedDocumentString<PostQuery, PostQueryVariables>;
export const AllPostsDocument = new TypedDocumentString(`
    query AllPosts @cached {
  posts(order_by: {slug: desc}) {
    brief
    id
    markdownContent
    readTimeInMinutes
    title
    slug
  }
}
    `) as unknown as TypedDocumentString<AllPostsQuery, AllPostsQueryVariables>;
export const FeatureFlagsDocument = new TypedDocumentString(`
    subscription FeatureFlags {
  feature_flag {
    id
    name
    conditions
  }
}
    `) as unknown as TypedDocumentString<FeatureFlagsSubscription, FeatureFlagsSubscriptionVariables>;
export const MarkNotificationAsReadDocument = new TypedDocumentString(`
    mutation MarkNotificationAsRead($notificationId: uuid!) {
  update_notifications_by_pk(
    pk_columns: {id: $notificationId}
    _set: {readAt: "now()"}
  ) {
    id
    readAt
  }
}
    `) as unknown as TypedDocumentString<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkNotificationsAsReadDocument = new TypedDocumentString(`
    mutation MarkNotificationsAsRead($ids: [uuid!]!) {
  update_notifications(
    where: {id: {_in: $ids}, readAt: {_is_null: true}}
    _set: {readAt: "now()"}
  ) {
    affected_rows
    returning {
      id
      readAt
    }
  }
}
    `) as unknown as TypedDocumentString<MarkNotificationsAsReadMutation, MarkNotificationsAsReadMutationVariables>;
export const NotificationsDocument = new TypedDocumentString(`
    subscription Notifications {
  notifications(order_by: {createdAt: desc}) {
    id
    entityId
    entityType
    type
    readAt
    link
    metadata
    video {
      id
      title
    }
  }
}
    `) as unknown as TypedDocumentString<NotificationsSubscription, NotificationsSubscriptionVariables>;
export const InsertVideosDocument = new TypedDocumentString(`
    mutation InsertVideos($objects: [videos_insert_input!]!) {
  insert_videos(objects: $objects) {
    returning {
      id
      title
      description
    }
  }
}
    `) as unknown as TypedDocumentString<InsertVideosMutation, InsertVideosMutationVariables>;
export const UpdateVideoProgressDocument = new TypedDocumentString(`
    mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {
  insert_user_video_history_one(
    object: {video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt}
    on_conflict: {constraint: user_video_history_user_id_video_id_key, update_columns: [progress_seconds, last_watched_at]}
  ) {
    id
    progress_seconds
    last_watched_at
  }
}
    `) as unknown as TypedDocumentString<UpdateVideoProgressMutation, UpdateVideoProgressMutationVariables>;
export const UserVideoHistoryDocument = new TypedDocumentString(`
    query UserVideoHistory {
  user_video_history(
    where: {_and: {last_watched_at: {_is_null: false}, progress_seconds: {_gt: 0}, video: {source: {_is_null: false}}}}
    order_by: {last_watched_at: desc}
  ) {
    id
    last_watched_at
    progress_seconds
    video {
      id
      title
      source
      slug
      thumbnailUrl
      duration
      createdAt
      user {
        ...UserFields
      }
      playlist_videos {
        playlist {
          id
          slug
          title
          thumbnailUrl
        }
      }
    }
  }
}
    fragment UserFields on users {
  username
}`) as unknown as TypedDocumentString<UserVideoHistoryQuery, UserVideoHistoryQueryVariables>;
export const PlaylistDetailDocument = new TypedDocumentString(`
    query PlaylistDetail($id: uuid!) {
  playlist_by_pk(id: $id) {
    ...PlaylistFields
  }
}
    fragment UserFields on users {
  username
}
fragment VideoFields on videos {
  id
  title
  description
  duration
  thumbnailUrl
  source
  slug
  createdAt
  user {
    ...UserFields
  }
  user_video_histories {
    last_watched_at
    progress_seconds
  }
  subtitles {
    id
    isDefault
    lang
    url
  }
}
fragment PlaylistVideoFields on playlist_videos {
  position
  video {
    ...VideoFields
  }
}
fragment PlaylistFields on playlist {
  id
  title
  thumbnailUrl
  slug
  createdAt
  description
  user {
    ...UserFields
  }
  playlist_videos(
    where: {video: {status: {_eq: "ready"}}}
    order_by: {position: asc}
  ) {
    ...PlaylistVideoFields
  }
}`) as unknown as TypedDocumentString<PlaylistDetailQuery, PlaylistDetailQueryVariables>;
export const PlaylistsDocument = new TypedDocumentString(`
    query Playlists {
  playlist(order_by: {createdAt: desc}) {
    title
    id
    slug
  }
}
    `) as unknown as TypedDocumentString<PlaylistsQuery, PlaylistsQueryVariables>;
export const VideoDetailDocument = new TypedDocumentString(`
    query VideoDetail($id: uuid!) @cached {
  videos(
    where: {_and: {_not: {playlist_videos: {}}, status: {_eq: "ready"}}}
    order_by: {createdAt: desc}
  ) {
    ...VideoFields
  }
  videos_by_pk(id: $id) {
    id
    source
    thumbnailUrl
    title
    description
  }
}
    fragment UserFields on users {
  username
}
fragment VideoFields on videos {
  id
  title
  description
  duration
  thumbnailUrl
  source
  slug
  createdAt
  user {
    ...UserFields
  }
  user_video_histories {
    last_watched_at
    progress_seconds
  }
  subtitles {
    id
    isDefault
    lang
    url
  }
}`) as unknown as TypedDocumentString<VideoDetailQuery, VideoDetailQueryVariables>;
export const AllVideosDocument = new TypedDocumentString(`
    query AllVideos @cached {
  videos(
    where: {_and: {_not: {playlist_videos: {}}, status: {_eq: "ready"}}}
    order_by: {createdAt: desc}
  ) {
    ...VideoFields
  }
  playlist(
    where: {playlist_videos_aggregate: {count: {predicate: {_gt: 0}, filter: {video: {status: {_eq: "ready"}}}}}}
  ) {
    ...PlaylistFields
  }
}
    fragment UserFields on users {
  username
}
fragment VideoFields on videos {
  id
  title
  description
  duration
  thumbnailUrl
  source
  slug
  createdAt
  user {
    ...UserFields
  }
  user_video_histories {
    last_watched_at
    progress_seconds
  }
  subtitles {
    id
    isDefault
    lang
    url
  }
}
fragment PlaylistVideoFields on playlist_videos {
  position
  video {
    ...VideoFields
  }
}
fragment PlaylistFields on playlist {
  id
  title
  thumbnailUrl
  slug
  createdAt
  description
  user {
    ...UserFields
  }
  playlist_videos(
    where: {video: {status: {_eq: "ready"}}}
    order_by: {position: asc}
  ) {
    ...PlaylistVideoFields
  }
}`) as unknown as TypedDocumentString<AllVideosQuery, AllVideosQueryVariables>;