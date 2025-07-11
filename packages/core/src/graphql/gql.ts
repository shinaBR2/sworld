/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateFinanceRecord($object: finance_transactions_insert_input!) {\n    insert_finance_transactions_one(object: $object) {\n      id\n      name\n      amount\n      month\n      year\n      category\n      createdAt\n    }\n  }\n": typeof types.CreateFinanceRecordDocument,
    "\n  mutation UpdateFinanceRecord($id: uuid!, $object: finance_transactions_set_input!) {\n    update_finance_transactions_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n      name\n      amount\n      month\n      year\n      category\n      updatedAt\n    }\n  }\n": typeof types.UpdateFinanceRecordDocument,
    "\n  mutation DeleteFinanceRecord($id: uuid!) {\n    delete_finance_transactions_by_pk(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteFinanceRecordDocument,
    "\n  query GetFinanceRecords($month: Int!, $year: Int!) {\n    finance_transactions(where: { month: { _eq: $month }, year: { _eq: $year } }, order_by: { createdAt: desc }) {\n      id\n      name\n      amount\n      note\n      month\n      year\n      category\n      createdAt\n      updatedAt\n    }\n    must_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"must\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    nice_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"nice\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    waste_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"waste\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    oldest_aggregate: finance_transactions(order_by: { year: asc, month: asc }, limit: 1) {\n      year\n      month\n    }\n  }\n": typeof types.GetFinanceRecordsDocument,
    "\n  query GetMonthlyComparison {\n    monthly_totals: finance_transactions_aggregate(order_by: { year: desc, month: desc }) {\n      nodes {\n        month\n        year\n      }\n      aggregate {\n        sum {\n          amount\n        }\n        count\n      }\n    }\n  }\n": typeof types.GetMonthlyComparisonDocument,
    "\n  mutation CreateJournal($object: journals_insert_input!) {\n    insert_journals_one(object: $object) {\n      id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateJournalDocument,
    "\n  mutation UpdateJournal($id: uuid!, $set: journals_set_input!) {\n    update_journals_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n      date\n      content\n      mood\n      tags\n      updatedAt\n    }\n  }\n": typeof types.UpdateJournalDocument,
    "\n  mutation DeleteJournal($id: uuid!) {\n    delete_journals_by_pk(id: $id) {\n      id\n      date\n    }\n  }\n": typeof types.DeleteJournalDocument,
    "\n  query GetJournalsByMonth($startDate: date!, $endDate: date!) {\n    journals(where: { date: { _gte: $startDate, _lte: $endDate } }, order_by: { date: desc, createdAt: desc }) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n    happy_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"happy\" } }) {\n      aggregate {\n        count\n      }\n    }\n    neutral_aggregate: journals_aggregate(\n      where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"neutral\" } }\n    ) {\n      aggregate {\n        count\n      }\n    }\n    sad_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"sad\" } }) {\n      aggregate {\n        count\n      }\n    }\n    oldest_aggregate: journals(order_by: { date: asc }, limit: 1) {\n      date\n    }\n  }\n": typeof types.GetJournalsByMonthDocument,
    "\n  query GetJournalById($id: uuid!) {\n    journals_by_pk(id: $id) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetJournalByIdDocument,
    "\n  mutation UpsertReadingProgress($bookId: uuid!, $currentPage: Int!, $totalPages: Int, $readingTimeMinutes: Int) {\n    insert_reading_progresses_one(\n      object: {\n        bookId: $bookId\n        currentPage: $currentPage\n        totalPages: $totalPages\n        readingTimeMinutes: $readingTimeMinutes\n        lastReadAt: \"now()\"\n      }\n      on_conflict: {\n        constraint: reading_progresses_user_id_book_id_key\n        update_columns: [currentPage, readingTimeMinutes, lastReadAt]\n      }\n    ) {\n      id\n      currentPage\n      percentage\n      lastReadAt\n    }\n  }\n": typeof types.UpsertReadingProgressDocument,
    "\n  query GetBookById($id: uuid!) {\n    books_by_pk(id: $id) {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": typeof types.GetBookByIdDocument,
    "\n  query GetBooks {\n    books {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": typeof types.GetBooksDocument,
    "\n  query GetCurrentReading {\n    reading_progresses(where: { percentage: { _gt: 0, _lt: 100 } }, order_by: { lastReadAt: desc }, limit: 1) {\n      id\n      currentPage\n      totalPages\n      percentage\n      lastReadAt\n      book {\n        id\n        title\n        author\n        totalPages\n        thumbnailUrl\n      }\n    }\n  }\n": typeof types.GetCurrentReadingDocument,
    "\n  query GetReadingStats($monthStart: timestamptz!) {\n    books_aggregate {\n      aggregate {\n        count\n      }\n    }\n    completed_books: books_aggregate(where: { reading_progresses: { percentage: { _gte: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    currently_reading: books_aggregate(where: { reading_progresses: { percentage: { _gt: 0, _lt: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    reading_time_this_month: reading_progresses_aggregate(where: { lastReadAt: { _gte: $monthStart } }) {\n      aggregate {\n        sum {\n          readingTimeMinutes\n        }\n      }\n    }\n  }\n": typeof types.GetReadingStatsDocument,
    "\n  query GetAudiosAndFeelings @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      public\n      artistName\n      createdAt\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n  }\n": typeof types.GetAudiosAndFeelingsDocument,
    "\n  query GetPublicAudiosAndFeelings @cached {\n    audios(where: { public: { _eq: true } }) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" }, audio_tags: { audio: { public: { _eq: true } } } }) {\n      id\n      name\n    }\n  }\n": typeof types.GetPublicAudiosAndFeelingsDocument,
    "\n  query Post($id: uuid!) @cached {\n    posts_by_pk(id: $id) {\n      title\n      readTimeInMinutes\n      markdownContent\n      id\n      brief\n      slug\n    }\n  }\n": typeof types.PostDocument,
    "\n  query AllPosts @cached {\n    posts(order_by: { slug: desc }) {\n      brief\n      id\n      markdownContent\n      readTimeInMinutes\n      title\n      slug\n    }\n  }\n": typeof types.AllPostsDocument,
    "\n  subscription FeatureFlags {\n    feature_flag {\n      id\n      name\n      conditions\n    }\n  }\n": typeof types.FeatureFlagsDocument,
    "\n  mutation MarkNotificationAsRead($notificationId: uuid!) {\n    update_notifications_by_pk(pk_columns: { id: $notificationId }, _set: { readAt: \"now()\" }) {\n      id\n      readAt\n    }\n  }\n": typeof types.MarkNotificationAsReadDocument,
    "\n  mutation MarkNotificationsAsRead($ids: [uuid!]!) {\n    update_notifications(where: { id: { _in: $ids }, readAt: { _is_null: true } }, _set: { readAt: \"now()\" }) {\n      affected_rows\n      returning {\n        id\n        readAt\n      }\n    }\n  }\n": typeof types.MarkNotificationsAsReadDocument,
    "\n  subscription Notifications {\n    notifications(order_by: { createdAt: desc }) {\n      id\n      entityId\n      entityType\n      type\n      readAt\n      link\n      metadata\n      video {\n        id\n        title\n      }\n    }\n  }\n": typeof types.NotificationsDocument,
    "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n": typeof types.InsertVideosDocument,
    "\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n": typeof types.SaveSubtitleDocument,
    "\n  mutation sharePlaylist($id: uuid!, $emails: jsonb) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": typeof types.SharePlaylistDocument,
    "\n  mutation shareVideo($id: uuid!, $emails: jsonb) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": typeof types.ShareVideoDocument,
    "\n  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {\n    insert_user_video_history_one(\n      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }\n      on_conflict: {\n        constraint: user_video_history_user_id_video_id_key\n        update_columns: [progress_seconds, last_watched_at]\n      }\n    ) {\n      id\n      progress_seconds\n      last_watched_at\n    }\n  }\n": typeof types.UpdateVideoProgressDocument,
    "\n  fragment UserFields on users {\n    username\n  }\n": typeof types.UserFieldsFragmentDoc,
    "\n  fragment VideoFields on videos {\n    id\n    title\n    description\n    duration\n    thumbnailUrl\n    source\n    slug\n    createdAt\n    user {\n      ...UserFields\n    }\n    user_video_histories {\n      last_watched_at\n      progress_seconds\n    }\n    subtitles {\n      id\n      isDefault\n      lang\n      url\n    }\n  }\n": typeof types.VideoFieldsFragmentDoc,
    "\n  fragment PlaylistVideoFields on playlist_videos {\n    position\n    video {\n      ...VideoFields\n    }\n  }\n": typeof types.PlaylistVideoFieldsFragmentDoc,
    "\n  fragment PlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    user {\n      ...UserFields\n    }\n    playlist_videos(where: { video: { status: { _eq: \"ready\" } } }, order_by: { position: asc }) {\n      ...PlaylistVideoFields\n    }\n  }\n": typeof types.PlaylistFieldsFragmentDoc,
    "\n  query UserVideoHistory {\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n": typeof types.UserVideoHistoryDocument,
    "\n  query PlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...PlaylistFields\n    }\n  }\n": typeof types.PlaylistDetailDocument,
    "\n  query Playlists {\n    playlist(order_by: { createdAt: desc }) {\n      title\n      id\n      slug\n    }\n  }\n": typeof types.PlaylistsDocument,
    "\n  query VideoDetail($id: uuid!) @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    videos_by_pk(id: $id) {\n      id\n      source\n      thumbnailUrl\n      title\n      description\n    }\n  }\n": typeof types.VideoDetailDocument,
    "\n  query AllVideos @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    playlist(\n      where: {\n        playlist_videos_aggregate: { count: { predicate: { _gt: 0 }, filter: { video: { status: { _eq: \"ready\" } } } } }\n      }\n    ) {\n      ...PlaylistFields\n    }\n  }\n": typeof types.AllVideosDocument,
};
const documents: Documents = {
    "\n  mutation CreateFinanceRecord($object: finance_transactions_insert_input!) {\n    insert_finance_transactions_one(object: $object) {\n      id\n      name\n      amount\n      month\n      year\n      category\n      createdAt\n    }\n  }\n": types.CreateFinanceRecordDocument,
    "\n  mutation UpdateFinanceRecord($id: uuid!, $object: finance_transactions_set_input!) {\n    update_finance_transactions_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n      name\n      amount\n      month\n      year\n      category\n      updatedAt\n    }\n  }\n": types.UpdateFinanceRecordDocument,
    "\n  mutation DeleteFinanceRecord($id: uuid!) {\n    delete_finance_transactions_by_pk(id: $id) {\n      id\n    }\n  }\n": types.DeleteFinanceRecordDocument,
    "\n  query GetFinanceRecords($month: Int!, $year: Int!) {\n    finance_transactions(where: { month: { _eq: $month }, year: { _eq: $year } }, order_by: { createdAt: desc }) {\n      id\n      name\n      amount\n      note\n      month\n      year\n      category\n      createdAt\n      updatedAt\n    }\n    must_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"must\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    nice_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"nice\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    waste_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"waste\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    oldest_aggregate: finance_transactions(order_by: { year: asc, month: asc }, limit: 1) {\n      year\n      month\n    }\n  }\n": types.GetFinanceRecordsDocument,
    "\n  query GetMonthlyComparison {\n    monthly_totals: finance_transactions_aggregate(order_by: { year: desc, month: desc }) {\n      nodes {\n        month\n        year\n      }\n      aggregate {\n        sum {\n          amount\n        }\n        count\n      }\n    }\n  }\n": types.GetMonthlyComparisonDocument,
    "\n  mutation CreateJournal($object: journals_insert_input!) {\n    insert_journals_one(object: $object) {\n      id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateJournalDocument,
    "\n  mutation UpdateJournal($id: uuid!, $set: journals_set_input!) {\n    update_journals_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n      date\n      content\n      mood\n      tags\n      updatedAt\n    }\n  }\n": types.UpdateJournalDocument,
    "\n  mutation DeleteJournal($id: uuid!) {\n    delete_journals_by_pk(id: $id) {\n      id\n      date\n    }\n  }\n": types.DeleteJournalDocument,
    "\n  query GetJournalsByMonth($startDate: date!, $endDate: date!) {\n    journals(where: { date: { _gte: $startDate, _lte: $endDate } }, order_by: { date: desc, createdAt: desc }) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n    happy_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"happy\" } }) {\n      aggregate {\n        count\n      }\n    }\n    neutral_aggregate: journals_aggregate(\n      where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"neutral\" } }\n    ) {\n      aggregate {\n        count\n      }\n    }\n    sad_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"sad\" } }) {\n      aggregate {\n        count\n      }\n    }\n    oldest_aggregate: journals(order_by: { date: asc }, limit: 1) {\n      date\n    }\n  }\n": types.GetJournalsByMonthDocument,
    "\n  query GetJournalById($id: uuid!) {\n    journals_by_pk(id: $id) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetJournalByIdDocument,
    "\n  mutation UpsertReadingProgress($bookId: uuid!, $currentPage: Int!, $totalPages: Int, $readingTimeMinutes: Int) {\n    insert_reading_progresses_one(\n      object: {\n        bookId: $bookId\n        currentPage: $currentPage\n        totalPages: $totalPages\n        readingTimeMinutes: $readingTimeMinutes\n        lastReadAt: \"now()\"\n      }\n      on_conflict: {\n        constraint: reading_progresses_user_id_book_id_key\n        update_columns: [currentPage, readingTimeMinutes, lastReadAt]\n      }\n    ) {\n      id\n      currentPage\n      percentage\n      lastReadAt\n    }\n  }\n": types.UpsertReadingProgressDocument,
    "\n  query GetBookById($id: uuid!) {\n    books_by_pk(id: $id) {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": types.GetBookByIdDocument,
    "\n  query GetBooks {\n    books {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": types.GetBooksDocument,
    "\n  query GetCurrentReading {\n    reading_progresses(where: { percentage: { _gt: 0, _lt: 100 } }, order_by: { lastReadAt: desc }, limit: 1) {\n      id\n      currentPage\n      totalPages\n      percentage\n      lastReadAt\n      book {\n        id\n        title\n        author\n        totalPages\n        thumbnailUrl\n      }\n    }\n  }\n": types.GetCurrentReadingDocument,
    "\n  query GetReadingStats($monthStart: timestamptz!) {\n    books_aggregate {\n      aggregate {\n        count\n      }\n    }\n    completed_books: books_aggregate(where: { reading_progresses: { percentage: { _gte: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    currently_reading: books_aggregate(where: { reading_progresses: { percentage: { _gt: 0, _lt: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    reading_time_this_month: reading_progresses_aggregate(where: { lastReadAt: { _gte: $monthStart } }) {\n      aggregate {\n        sum {\n          readingTimeMinutes\n        }\n      }\n    }\n  }\n": types.GetReadingStatsDocument,
    "\n  query GetAudiosAndFeelings @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      public\n      artistName\n      createdAt\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n  }\n": types.GetAudiosAndFeelingsDocument,
    "\n  query GetPublicAudiosAndFeelings @cached {\n    audios(where: { public: { _eq: true } }) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" }, audio_tags: { audio: { public: { _eq: true } } } }) {\n      id\n      name\n    }\n  }\n": types.GetPublicAudiosAndFeelingsDocument,
    "\n  query Post($id: uuid!) @cached {\n    posts_by_pk(id: $id) {\n      title\n      readTimeInMinutes\n      markdownContent\n      id\n      brief\n      slug\n    }\n  }\n": types.PostDocument,
    "\n  query AllPosts @cached {\n    posts(order_by: { slug: desc }) {\n      brief\n      id\n      markdownContent\n      readTimeInMinutes\n      title\n      slug\n    }\n  }\n": types.AllPostsDocument,
    "\n  subscription FeatureFlags {\n    feature_flag {\n      id\n      name\n      conditions\n    }\n  }\n": types.FeatureFlagsDocument,
    "\n  mutation MarkNotificationAsRead($notificationId: uuid!) {\n    update_notifications_by_pk(pk_columns: { id: $notificationId }, _set: { readAt: \"now()\" }) {\n      id\n      readAt\n    }\n  }\n": types.MarkNotificationAsReadDocument,
    "\n  mutation MarkNotificationsAsRead($ids: [uuid!]!) {\n    update_notifications(where: { id: { _in: $ids }, readAt: { _is_null: true } }, _set: { readAt: \"now()\" }) {\n      affected_rows\n      returning {\n        id\n        readAt\n      }\n    }\n  }\n": types.MarkNotificationsAsReadDocument,
    "\n  subscription Notifications {\n    notifications(order_by: { createdAt: desc }) {\n      id\n      entityId\n      entityType\n      type\n      readAt\n      link\n      metadata\n      video {\n        id\n        title\n      }\n    }\n  }\n": types.NotificationsDocument,
    "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n": types.InsertVideosDocument,
    "\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n": types.SaveSubtitleDocument,
    "\n  mutation sharePlaylist($id: uuid!, $emails: jsonb) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": types.SharePlaylistDocument,
    "\n  mutation shareVideo($id: uuid!, $emails: jsonb) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": types.ShareVideoDocument,
    "\n  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {\n    insert_user_video_history_one(\n      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }\n      on_conflict: {\n        constraint: user_video_history_user_id_video_id_key\n        update_columns: [progress_seconds, last_watched_at]\n      }\n    ) {\n      id\n      progress_seconds\n      last_watched_at\n    }\n  }\n": types.UpdateVideoProgressDocument,
    "\n  fragment UserFields on users {\n    username\n  }\n": types.UserFieldsFragmentDoc,
    "\n  fragment VideoFields on videos {\n    id\n    title\n    description\n    duration\n    thumbnailUrl\n    source\n    slug\n    createdAt\n    user {\n      ...UserFields\n    }\n    user_video_histories {\n      last_watched_at\n      progress_seconds\n    }\n    subtitles {\n      id\n      isDefault\n      lang\n      url\n    }\n  }\n": types.VideoFieldsFragmentDoc,
    "\n  fragment PlaylistVideoFields on playlist_videos {\n    position\n    video {\n      ...VideoFields\n    }\n  }\n": types.PlaylistVideoFieldsFragmentDoc,
    "\n  fragment PlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    user {\n      ...UserFields\n    }\n    playlist_videos(where: { video: { status: { _eq: \"ready\" } } }, order_by: { position: asc }) {\n      ...PlaylistVideoFields\n    }\n  }\n": types.PlaylistFieldsFragmentDoc,
    "\n  query UserVideoHistory {\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n": types.UserVideoHistoryDocument,
    "\n  query PlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...PlaylistFields\n    }\n  }\n": types.PlaylistDetailDocument,
    "\n  query Playlists {\n    playlist(order_by: { createdAt: desc }) {\n      title\n      id\n      slug\n    }\n  }\n": types.PlaylistsDocument,
    "\n  query VideoDetail($id: uuid!) @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    videos_by_pk(id: $id) {\n      id\n      source\n      thumbnailUrl\n      title\n      description\n    }\n  }\n": types.VideoDetailDocument,
    "\n  query AllVideos @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    playlist(\n      where: {\n        playlist_videos_aggregate: { count: { predicate: { _gt: 0 }, filter: { video: { status: { _eq: \"ready\" } } } } }\n      }\n    ) {\n      ...PlaylistFields\n    }\n  }\n": types.AllVideosDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateFinanceRecord($object: finance_transactions_insert_input!) {\n    insert_finance_transactions_one(object: $object) {\n      id\n      name\n      amount\n      month\n      year\n      category\n      createdAt\n    }\n  }\n"): typeof import('./graphql').CreateFinanceRecordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateFinanceRecord($id: uuid!, $object: finance_transactions_set_input!) {\n    update_finance_transactions_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n      name\n      amount\n      month\n      year\n      category\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').UpdateFinanceRecordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteFinanceRecord($id: uuid!) {\n    delete_finance_transactions_by_pk(id: $id) {\n      id\n    }\n  }\n"): typeof import('./graphql').DeleteFinanceRecordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFinanceRecords($month: Int!, $year: Int!) {\n    finance_transactions(where: { month: { _eq: $month }, year: { _eq: $year } }, order_by: { createdAt: desc }) {\n      id\n      name\n      amount\n      note\n      month\n      year\n      category\n      createdAt\n      updatedAt\n    }\n    must_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"must\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    nice_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"nice\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    waste_aggregate: finance_transactions_aggregate(\n      where: { month: { _eq: $month }, year: { _eq: $year }, category: { _eq: \"waste\" } }\n    ) {\n      aggregate {\n        count\n        sum {\n          amount\n        }\n      }\n    }\n    oldest_aggregate: finance_transactions(order_by: { year: asc, month: asc }, limit: 1) {\n      year\n      month\n    }\n  }\n"): typeof import('./graphql').GetFinanceRecordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetMonthlyComparison {\n    monthly_totals: finance_transactions_aggregate(order_by: { year: desc, month: desc }) {\n      nodes {\n        month\n        year\n      }\n      aggregate {\n        sum {\n          amount\n        }\n        count\n      }\n    }\n  }\n"): typeof import('./graphql').GetMonthlyComparisonDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateJournal($object: journals_insert_input!) {\n    insert_journals_one(object: $object) {\n      id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').CreateJournalDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateJournal($id: uuid!, $set: journals_set_input!) {\n    update_journals_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n      date\n      content\n      mood\n      tags\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').UpdateJournalDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteJournal($id: uuid!) {\n    delete_journals_by_pk(id: $id) {\n      id\n      date\n    }\n  }\n"): typeof import('./graphql').DeleteJournalDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetJournalsByMonth($startDate: date!, $endDate: date!) {\n    journals(where: { date: { _gte: $startDate, _lte: $endDate } }, order_by: { date: desc, createdAt: desc }) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n    happy_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"happy\" } }) {\n      aggregate {\n        count\n      }\n    }\n    neutral_aggregate: journals_aggregate(\n      where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"neutral\" } }\n    ) {\n      aggregate {\n        count\n      }\n    }\n    sad_aggregate: journals_aggregate(where: { date: { _gte: $startDate, _lte: $endDate }, mood: { _eq: \"sad\" } }) {\n      aggregate {\n        count\n      }\n    }\n    oldest_aggregate: journals(order_by: { date: asc }, limit: 1) {\n      date\n    }\n  }\n"): typeof import('./graphql').GetJournalsByMonthDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetJournalById($id: uuid!) {\n    journals_by_pk(id: $id) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').GetJournalByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpsertReadingProgress($bookId: uuid!, $currentPage: Int!, $totalPages: Int, $readingTimeMinutes: Int) {\n    insert_reading_progresses_one(\n      object: {\n        bookId: $bookId\n        currentPage: $currentPage\n        totalPages: $totalPages\n        readingTimeMinutes: $readingTimeMinutes\n        lastReadAt: \"now()\"\n      }\n      on_conflict: {\n        constraint: reading_progresses_user_id_book_id_key\n        update_columns: [currentPage, readingTimeMinutes, lastReadAt]\n      }\n    ) {\n      id\n      currentPage\n      percentage\n      lastReadAt\n    }\n  }\n"): typeof import('./graphql').UpsertReadingProgressDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetBookById($id: uuid!) {\n    books_by_pk(id: $id) {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n"): typeof import('./graphql').GetBookByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetBooks {\n    books {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n"): typeof import('./graphql').GetBooksDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetCurrentReading {\n    reading_progresses(where: { percentage: { _gt: 0, _lt: 100 } }, order_by: { lastReadAt: desc }, limit: 1) {\n      id\n      currentPage\n      totalPages\n      percentage\n      lastReadAt\n      book {\n        id\n        title\n        author\n        totalPages\n        thumbnailUrl\n      }\n    }\n  }\n"): typeof import('./graphql').GetCurrentReadingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetReadingStats($monthStart: timestamptz!) {\n    books_aggregate {\n      aggregate {\n        count\n      }\n    }\n    completed_books: books_aggregate(where: { reading_progresses: { percentage: { _gte: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    currently_reading: books_aggregate(where: { reading_progresses: { percentage: { _gt: 0, _lt: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    reading_time_this_month: reading_progresses_aggregate(where: { lastReadAt: { _gte: $monthStart } }) {\n      aggregate {\n        sum {\n          readingTimeMinutes\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').GetReadingStatsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAudiosAndFeelings @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      public\n      artistName\n      createdAt\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n  }\n"): typeof import('./graphql').GetAudiosAndFeelingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPublicAudiosAndFeelings @cached {\n    audios(where: { public: { _eq: true } }) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" }, audio_tags: { audio: { public: { _eq: true } } } }) {\n      id\n      name\n    }\n  }\n"): typeof import('./graphql').GetPublicAudiosAndFeelingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Post($id: uuid!) @cached {\n    posts_by_pk(id: $id) {\n      title\n      readTimeInMinutes\n      markdownContent\n      id\n      brief\n      slug\n    }\n  }\n"): typeof import('./graphql').PostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllPosts @cached {\n    posts(order_by: { slug: desc }) {\n      brief\n      id\n      markdownContent\n      readTimeInMinutes\n      title\n      slug\n    }\n  }\n"): typeof import('./graphql').AllPostsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription FeatureFlags {\n    feature_flag {\n      id\n      name\n      conditions\n    }\n  }\n"): typeof import('./graphql').FeatureFlagsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkNotificationAsRead($notificationId: uuid!) {\n    update_notifications_by_pk(pk_columns: { id: $notificationId }, _set: { readAt: \"now()\" }) {\n      id\n      readAt\n    }\n  }\n"): typeof import('./graphql').MarkNotificationAsReadDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkNotificationsAsRead($ids: [uuid!]!) {\n    update_notifications(where: { id: { _in: $ids }, readAt: { _is_null: true } }, _set: { readAt: \"now()\" }) {\n      affected_rows\n      returning {\n        id\n        readAt\n      }\n    }\n  }\n"): typeof import('./graphql').MarkNotificationsAsReadDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription Notifications {\n    notifications(order_by: { createdAt: desc }) {\n      id\n      entityId\n      entityType\n      type\n      readAt\n      link\n      metadata\n      video {\n        id\n        title\n      }\n    }\n  }\n"): typeof import('./graphql').NotificationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n"): typeof import('./graphql').InsertVideosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n"): typeof import('./graphql').SaveSubtitleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation sharePlaylist($id: uuid!, $emails: jsonb) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n"): typeof import('./graphql').SharePlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation shareVideo($id: uuid!, $emails: jsonb) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n"): typeof import('./graphql').ShareVideoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {\n    insert_user_video_history_one(\n      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }\n      on_conflict: {\n        constraint: user_video_history_user_id_video_id_key\n        update_columns: [progress_seconds, last_watched_at]\n      }\n    ) {\n      id\n      progress_seconds\n      last_watched_at\n    }\n  }\n"): typeof import('./graphql').UpdateVideoProgressDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserFields on users {\n    username\n  }\n"): typeof import('./graphql').UserFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment VideoFields on videos {\n    id\n    title\n    description\n    duration\n    thumbnailUrl\n    source\n    slug\n    createdAt\n    user {\n      ...UserFields\n    }\n    user_video_histories {\n      last_watched_at\n      progress_seconds\n    }\n    subtitles {\n      id\n      isDefault\n      lang\n      url\n    }\n  }\n"): typeof import('./graphql').VideoFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PlaylistVideoFields on playlist_videos {\n    position\n    video {\n      ...VideoFields\n    }\n  }\n"): typeof import('./graphql').PlaylistVideoFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    user {\n      ...UserFields\n    }\n    playlist_videos(where: { video: { status: { _eq: \"ready\" } } }, order_by: { position: asc }) {\n      ...PlaylistVideoFields\n    }\n  }\n"): typeof import('./graphql').PlaylistFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserVideoHistory {\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').UserVideoHistoryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...PlaylistFields\n    }\n  }\n"): typeof import('./graphql').PlaylistDetailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Playlists {\n    playlist(order_by: { createdAt: desc }) {\n      title\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').PlaylistsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VideoDetail($id: uuid!) @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    videos_by_pk(id: $id) {\n      id\n      source\n      thumbnailUrl\n      title\n      description\n    }\n  }\n"): typeof import('./graphql').VideoDetailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllVideos @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    playlist(\n      where: {\n        playlist_videos_aggregate: { count: { predicate: { _gt: 0 }, filter: { video: { status: { _eq: \"ready\" } } } } }\n      }\n    ) {\n      ...PlaylistFields\n    }\n  }\n"): typeof import('./graphql').AllVideosDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
