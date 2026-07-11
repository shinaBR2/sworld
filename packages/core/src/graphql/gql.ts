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
    "\n  query GetJournalByDate($date: date!) {\n    journals(where: { date: { _eq: $date } }, limit: 1) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetJournalByDateDocument,
    "\n  mutation UpsertReadingProgress($bookId: uuid!, $currentPage: Int!, $totalPages: Int, $readingTimeMinutes: Int) {\n    insert_reading_progresses_one(\n      object: {\n        bookId: $bookId\n        currentPage: $currentPage\n        totalPages: $totalPages\n        readingTimeMinutes: $readingTimeMinutes\n        lastReadAt: \"now()\"\n      }\n      on_conflict: {\n        constraint: reading_progresses_user_id_book_id_key\n        update_columns: [currentPage, readingTimeMinutes, lastReadAt]\n      }\n    ) {\n      id\n      currentPage\n      percentage\n      lastReadAt\n    }\n  }\n": typeof types.UpsertReadingProgressDocument,
    "\n  query GetBookById($id: uuid!) {\n    books_by_pk(id: $id) {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": typeof types.GetBookByIdDocument,
    "\n  query GetBooks {\n    books {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": typeof types.GetBooksDocument,
    "\n  query GetCurrentReading {\n    reading_progresses(where: { percentage: { _gt: 0, _lt: 100 } }, order_by: { lastReadAt: desc }, limit: 1) {\n      id\n      currentPage\n      totalPages\n      percentage\n      lastReadAt\n      book {\n        id\n        title\n        author\n        totalPages\n        thumbnailUrl\n      }\n    }\n  }\n": typeof types.GetCurrentReadingDocument,
    "\n  query GetReadingStats($monthStart: timestamptz!) {\n    books_aggregate {\n      aggregate {\n        count\n      }\n    }\n    completed_books: books_aggregate(where: { reading_progresses: { percentage: { _gte: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    currently_reading: books_aggregate(where: { reading_progresses: { percentage: { _gt: 0, _lt: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    reading_time_this_month: reading_progresses_aggregate(where: { lastReadAt: { _gte: $monthStart } }) {\n      aggregate {\n        sum {\n          readingTimeMinutes\n        }\n      }\n    }\n  }\n": typeof types.GetReadingStatsDocument,
    "\n  mutation CreateListenPlaylist($object: playlist_insert_input!) {\n    insert_playlist_one(object: $object) {\n      id\n      slug\n    }\n  }\n": typeof types.CreateListenPlaylistDocument,
    "\n  mutation UpdatePlaylist($id: uuid!, $set: playlist_set_input!) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n    }\n  }\n": typeof types.UpdatePlaylistDocument,
    "\n  mutation DeletePlaylist($id: uuid!) {\n    delete_playlist_by_pk(id: $id) {\n      id\n    }\n  }\n": typeof types.DeletePlaylistDocument,
    "\n  mutation AddAudioToPlaylist($object: playlist_audios_insert_input!) {\n    insert_playlist_audios_one(object: $object) {\n      playlist_id\n      audio_id\n      position\n    }\n  }\n": typeof types.AddAudioToPlaylistDocument,
    "\n  mutation RemoveAudioFromPlaylist($playlistId: uuid!, $audioId: uuid!) {\n    delete_playlist_audios_by_pk(playlist_id: $playlistId, audio_id: $audioId) {\n      playlist_id\n      audio_id\n    }\n  }\n": typeof types.RemoveAudioFromPlaylistDocument,
    "\n  mutation ReorderPlaylistAudios($updates: [playlist_audios_updates!]!) {\n    update_playlist_audios_many(updates: $updates) {\n      affected_rows\n      returning {\n        playlist_id\n      }\n    }\n  }\n": typeof types.ReorderPlaylistAudiosDocument,
    "\n  mutation UpdateAudio($id: uuid!, $set: audios_set_input!) {\n    update_audios_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n    }\n  }\n": typeof types.UpdateAudioDocument,
    "\n  mutation DeleteAudio($id: uuid!) {\n    delete_audios_by_pk(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteAudioDocument,
    "\n  mutation AssignFeeling($object: audio_tags_insert_input!) {\n    insert_audio_tags_one(\n      object: $object\n      on_conflict: { constraint: audio_tags_pkey, update_columns: [] }\n    ) {\n      audio_id\n      tag_id\n    }\n  }\n": typeof types.AssignFeelingDocument,
    "\n  mutation UnassignFeeling($audioId: uuid!, $tagId: uuid!) {\n    delete_audio_tags_by_pk(audio_id: $audioId, tag_id: $tagId) {\n      audio_id\n      tag_id\n    }\n  }\n": typeof types.UnassignFeelingDocument,
    "\n  fragment AudioFields on audios {\n    id\n    name\n    source\n    thumbnailUrl\n    artistName\n  }\n": typeof types.AudioFieldsFragmentDoc,
    "\n  fragment PlaylistAudioFields on playlist_audios {\n    position\n    audio {\n      ...AudioFields\n    }\n  }\n": typeof types.PlaylistAudioFieldsFragmentDoc,
    "\n  fragment ListenPlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    playlist_audios(order_by: { position: asc }) {\n      ...PlaylistAudioFields\n    }\n  }\n": typeof types.ListenPlaylistFieldsFragmentDoc,
    "\n  query ListenHome @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n    playlist(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n    }\n  }\n": typeof types.ListenHomeDocument,
    "\n  query ListenManage($userId: uuid!) {\n    audios(\n      where: { user_id: { _eq: $userId } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { display_order: asc }\n    ) {\n      id\n      name\n    }\n    playlist(\n      where: { user_id: { _eq: $userId }, site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n      description\n      thumbnailUrl\n    }\n  }\n": typeof types.ListenManageDocument,
    "\n  query ListenPlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...ListenPlaylistFields\n    }\n  }\n": typeof types.ListenPlaylistDetailDocument,
    "\n  query ListenPlaylists {\n    playlist(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n    }\n  }\n": typeof types.ListenPlaylistsDocument,
    "\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n      title\n      slug\n      brief\n      markdownContent\n      readTimeInMinutes\n      created_at\n      updated_at\n    }\n  }\n": typeof types.InsertPostDocument,
    "\n  mutation UpdatePost($id: uuid!, $object: posts_set_input!) {\n    update_posts_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n      title\n      slug\n      brief\n      markdownContent\n      readTimeInMinutes\n      created_at\n      updated_at\n      status\n    }\n  }\n": typeof types.UpdatePostDocument,
    "\n  query Post($id: uuid!) {\n    posts_by_pk(id: $id) {\n      title\n      readTimeInMinutes\n      markdownContent\n      id\n      brief\n      slug\n      created_at\n      status\n      visibility\n      pinned\n    }\n  }\n": typeof types.PostDocument,
    "\n  query AllPosts {\n    posts(order_by: [{ pinned: desc }, { created_at: desc }]) {\n      brief\n      id\n      markdownContent\n      readTimeInMinutes\n      title\n      slug\n      created_at\n      status\n      visibility\n      pinned\n    }\n  }\n": typeof types.AllPostsDocument,
    "\n  subscription FeatureFlags {\n    feature_flag {\n      id\n      name\n      conditions\n    }\n  }\n": typeof types.FeatureFlagsDocument,
    "\n  mutation MarkNotificationAsRead($notificationId: uuid!) {\n    update_notifications_by_pk(pk_columns: { id: $notificationId }, _set: { readAt: \"now()\" }) {\n      id\n      readAt\n    }\n  }\n": typeof types.MarkNotificationAsReadDocument,
    "\n  mutation MarkNotificationsAsRead($ids: [uuid!]!) {\n    update_notifications(where: { id: { _in: $ids }, readAt: { _is_null: true } }, _set: { readAt: \"now()\" }) {\n      affected_rows\n      returning {\n        id\n        readAt\n      }\n    }\n  }\n": typeof types.MarkNotificationsAsReadDocument,
    "\n  subscription Notifications {\n    notifications(order_by: { createdAt: desc }) {\n      id\n      entityId\n      entityType\n      type\n      readAt\n      link\n      metadata\n      video {\n        id\n        title\n      }\n    }\n  }\n": typeof types.NotificationsDocument,
    "\n  mutation UpsertUserSettings($data: jsonb!) {\n    insert_user_settings_one(\n      object: { data: $data }\n      on_conflict: { constraint: user_settings_pkey, update_columns: [data] }\n    ) {\n      user_id\n      data\n    }\n  }\n": typeof types.UpsertUserSettingsDocument,
    "\n  query GetUserSettings {\n    user_settings {\n      data\n    }\n  }\n": typeof types.GetUserSettingsDocument,
    "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n": typeof types.InsertVideosDocument,
    "\n  mutation CreateSignedUploadUrl($input: SignedUploadUrlInput!) {\n    createSignedUploadUrl(input: $input) {\n      success\n      message\n      dataObject {\n        uploadUrl\n        publicUrl\n        objectPath\n        expiresAt\n      }\n    }\n  }\n": typeof types.CreateSignedUploadUrlDocument,
    "\n  mutation UpdateVideoManage($id: uuid!, $title: String, $thumbnailUrl: String) {\n    update_videos_by_pk(\n      pk_columns: { id: $id }\n      _set: { title: $title, thumbnailUrl: $thumbnailUrl }\n    ) {\n      id\n    }\n  }\n": typeof types.UpdateVideoManageDocument,
    "\n  mutation CreatePlaylistManage(\n    $title: String!\n    $slug: String!\n    $thumbnailUrl: String\n    $description: String\n  ) {\n    insert_playlist_one(\n      object: {\n        title: $title\n        slug: $slug\n        thumbnailUrl: $thumbnailUrl\n        description: $description\n        site: \"watch\"\n      }\n    ) {\n      id\n    }\n  }\n": typeof types.CreatePlaylistManageDocument,
    "\n  mutation UpdatePlaylistManage($id: uuid!, $title: String, $description: String) {\n    update_playlist_by_pk(\n      pk_columns: { id: $id }\n      _set: { title: $title, description: $description }\n    ) {\n      id\n    }\n  }\n": typeof types.UpdatePlaylistManageDocument,
    "\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n": typeof types.SaveSubtitleDocument,
    "\n  mutation SetVideoThumbnailAtTime($input: SetVideoThumbnailAtTimeInput!) {\n    setVideoThumbnailAtTime(input: $input) {\n      success\n      message\n      dataObject {\n        thumbnailUrl\n      }\n    }\n  }\n": typeof types.SetVideoThumbnailAtTimeDocument,
    "\n  mutation sharePlaylist($id: uuid!, $emails: jsonb) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": typeof types.SharePlaylistDocument,
    "\n  mutation shareVideo($id: uuid!, $emails: jsonb) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": typeof types.ShareVideoDocument,
    "\n  mutation UpdateVideoThumbnail($id: uuid!, $thumbnailUrl: String!) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { thumbnailUrl: $thumbnailUrl }) {\n      id\n      thumbnailUrl\n    }\n  }\n": typeof types.UpdateVideoThumbnailDocument,
    "\n  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {\n    insert_user_video_history_one(\n      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }\n      on_conflict: {\n        constraint: user_video_history_user_id_video_id_key\n        update_columns: [progress_seconds, last_watched_at]\n      }\n    ) {\n      id\n      progress_seconds\n      last_watched_at\n    }\n  }\n": typeof types.UpdateVideoProgressDocument,
    "\n  fragment UserFields on users {\n    username\n  }\n": typeof types.UserFieldsFragmentDoc,
    "\n  fragment VideoFields on videos {\n    id\n    title\n    description\n    duration\n    thumbnailUrl\n    source\n    slug\n    createdAt\n    user_id\n    user {\n      ...UserFields\n    }\n    user_video_histories {\n      last_watched_at\n      progress_seconds\n    }\n    subtitles {\n      id\n      isDefault\n      lang\n      url\n    }\n  }\n": typeof types.VideoFieldsFragmentDoc,
    "\n  fragment PlaylistVideoFields on playlist_videos {\n    position\n    video {\n      ...VideoFields\n    }\n  }\n": typeof types.PlaylistVideoFieldsFragmentDoc,
    "\n  fragment PlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    user {\n      ...UserFields\n    }\n    playlist_videos(where: { video: { status: { _eq: \"ready\" } } }, order_by: { position: asc }) {\n      ...PlaylistVideoFields\n    }\n  }\n": typeof types.PlaylistFieldsFragmentDoc,
    "\n  query UserVideoHistory {\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n": typeof types.UserVideoHistoryDocument,
    "\n  query PlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...PlaylistFields\n    }\n  }\n": typeof types.PlaylistDetailDocument,
    "\n  query Playlists {\n    playlist(order_by: { createdAt: desc }) {\n      title\n      id\n      slug\n    }\n  }\n": typeof types.PlaylistsDocument,
    "\n  query VideoDetail($id: uuid!) @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    videos_by_pk(id: $id) {\n      id\n      source\n      thumbnailUrl\n      title\n      description\n    }\n  }\n": typeof types.VideoDetailDocument,
    "\n  query AllVideos @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    playlist(\n      where: {\n        playlist_videos_aggregate: { count: { predicate: { _gt: 0 }, filter: { video: { status: { _eq: \"ready\" } } } } }\n      }\n    ) {\n      ...PlaylistFields\n    }\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n      limit: 20\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n": typeof types.AllVideosDocument,
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
    "\n  query GetJournalByDate($date: date!) {\n    journals(where: { date: { _eq: $date } }, limit: 1) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetJournalByDateDocument,
    "\n  mutation UpsertReadingProgress($bookId: uuid!, $currentPage: Int!, $totalPages: Int, $readingTimeMinutes: Int) {\n    insert_reading_progresses_one(\n      object: {\n        bookId: $bookId\n        currentPage: $currentPage\n        totalPages: $totalPages\n        readingTimeMinutes: $readingTimeMinutes\n        lastReadAt: \"now()\"\n      }\n      on_conflict: {\n        constraint: reading_progresses_user_id_book_id_key\n        update_columns: [currentPage, readingTimeMinutes, lastReadAt]\n      }\n    ) {\n      id\n      currentPage\n      percentage\n      lastReadAt\n    }\n  }\n": types.UpsertReadingProgressDocument,
    "\n  query GetBookById($id: uuid!) {\n    books_by_pk(id: $id) {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": types.GetBookByIdDocument,
    "\n  query GetBooks {\n    books {\n      id\n      title\n      author\n      thumbnailUrl\n      source\n      totalPages\n      createdAt\n      reading_progresses {\n        id\n        currentPage\n        totalPages\n        percentage\n        readingTimeMinutes\n        lastReadAt\n        createdAt\n      }\n    }\n  }\n": types.GetBooksDocument,
    "\n  query GetCurrentReading {\n    reading_progresses(where: { percentage: { _gt: 0, _lt: 100 } }, order_by: { lastReadAt: desc }, limit: 1) {\n      id\n      currentPage\n      totalPages\n      percentage\n      lastReadAt\n      book {\n        id\n        title\n        author\n        totalPages\n        thumbnailUrl\n      }\n    }\n  }\n": types.GetCurrentReadingDocument,
    "\n  query GetReadingStats($monthStart: timestamptz!) {\n    books_aggregate {\n      aggregate {\n        count\n      }\n    }\n    completed_books: books_aggregate(where: { reading_progresses: { percentage: { _gte: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    currently_reading: books_aggregate(where: { reading_progresses: { percentage: { _gt: 0, _lt: 100 } } }) {\n      aggregate {\n        count\n      }\n    }\n    reading_time_this_month: reading_progresses_aggregate(where: { lastReadAt: { _gte: $monthStart } }) {\n      aggregate {\n        sum {\n          readingTimeMinutes\n        }\n      }\n    }\n  }\n": types.GetReadingStatsDocument,
    "\n  mutation CreateListenPlaylist($object: playlist_insert_input!) {\n    insert_playlist_one(object: $object) {\n      id\n      slug\n    }\n  }\n": types.CreateListenPlaylistDocument,
    "\n  mutation UpdatePlaylist($id: uuid!, $set: playlist_set_input!) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n    }\n  }\n": types.UpdatePlaylistDocument,
    "\n  mutation DeletePlaylist($id: uuid!) {\n    delete_playlist_by_pk(id: $id) {\n      id\n    }\n  }\n": types.DeletePlaylistDocument,
    "\n  mutation AddAudioToPlaylist($object: playlist_audios_insert_input!) {\n    insert_playlist_audios_one(object: $object) {\n      playlist_id\n      audio_id\n      position\n    }\n  }\n": types.AddAudioToPlaylistDocument,
    "\n  mutation RemoveAudioFromPlaylist($playlistId: uuid!, $audioId: uuid!) {\n    delete_playlist_audios_by_pk(playlist_id: $playlistId, audio_id: $audioId) {\n      playlist_id\n      audio_id\n    }\n  }\n": types.RemoveAudioFromPlaylistDocument,
    "\n  mutation ReorderPlaylistAudios($updates: [playlist_audios_updates!]!) {\n    update_playlist_audios_many(updates: $updates) {\n      affected_rows\n      returning {\n        playlist_id\n      }\n    }\n  }\n": types.ReorderPlaylistAudiosDocument,
    "\n  mutation UpdateAudio($id: uuid!, $set: audios_set_input!) {\n    update_audios_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n    }\n  }\n": types.UpdateAudioDocument,
    "\n  mutation DeleteAudio($id: uuid!) {\n    delete_audios_by_pk(id: $id) {\n      id\n    }\n  }\n": types.DeleteAudioDocument,
    "\n  mutation AssignFeeling($object: audio_tags_insert_input!) {\n    insert_audio_tags_one(\n      object: $object\n      on_conflict: { constraint: audio_tags_pkey, update_columns: [] }\n    ) {\n      audio_id\n      tag_id\n    }\n  }\n": types.AssignFeelingDocument,
    "\n  mutation UnassignFeeling($audioId: uuid!, $tagId: uuid!) {\n    delete_audio_tags_by_pk(audio_id: $audioId, tag_id: $tagId) {\n      audio_id\n      tag_id\n    }\n  }\n": types.UnassignFeelingDocument,
    "\n  fragment AudioFields on audios {\n    id\n    name\n    source\n    thumbnailUrl\n    artistName\n  }\n": types.AudioFieldsFragmentDoc,
    "\n  fragment PlaylistAudioFields on playlist_audios {\n    position\n    audio {\n      ...AudioFields\n    }\n  }\n": types.PlaylistAudioFieldsFragmentDoc,
    "\n  fragment ListenPlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    playlist_audios(order_by: { position: asc }) {\n      ...PlaylistAudioFields\n    }\n  }\n": types.ListenPlaylistFieldsFragmentDoc,
    "\n  query ListenHome @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n    playlist(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n    }\n  }\n": types.ListenHomeDocument,
    "\n  query ListenManage($userId: uuid!) {\n    audios(\n      where: { user_id: { _eq: $userId } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { display_order: asc }\n    ) {\n      id\n      name\n    }\n    playlist(\n      where: { user_id: { _eq: $userId }, site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n      description\n      thumbnailUrl\n    }\n  }\n": types.ListenManageDocument,
    "\n  query ListenPlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...ListenPlaylistFields\n    }\n  }\n": types.ListenPlaylistDetailDocument,
    "\n  query ListenPlaylists {\n    playlist(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n    }\n  }\n": types.ListenPlaylistsDocument,
    "\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n      title\n      slug\n      brief\n      markdownContent\n      readTimeInMinutes\n      created_at\n      updated_at\n    }\n  }\n": types.InsertPostDocument,
    "\n  mutation UpdatePost($id: uuid!, $object: posts_set_input!) {\n    update_posts_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n      title\n      slug\n      brief\n      markdownContent\n      readTimeInMinutes\n      created_at\n      updated_at\n      status\n    }\n  }\n": types.UpdatePostDocument,
    "\n  query Post($id: uuid!) {\n    posts_by_pk(id: $id) {\n      title\n      readTimeInMinutes\n      markdownContent\n      id\n      brief\n      slug\n      created_at\n      status\n      visibility\n      pinned\n    }\n  }\n": types.PostDocument,
    "\n  query AllPosts {\n    posts(order_by: [{ pinned: desc }, { created_at: desc }]) {\n      brief\n      id\n      markdownContent\n      readTimeInMinutes\n      title\n      slug\n      created_at\n      status\n      visibility\n      pinned\n    }\n  }\n": types.AllPostsDocument,
    "\n  subscription FeatureFlags {\n    feature_flag {\n      id\n      name\n      conditions\n    }\n  }\n": types.FeatureFlagsDocument,
    "\n  mutation MarkNotificationAsRead($notificationId: uuid!) {\n    update_notifications_by_pk(pk_columns: { id: $notificationId }, _set: { readAt: \"now()\" }) {\n      id\n      readAt\n    }\n  }\n": types.MarkNotificationAsReadDocument,
    "\n  mutation MarkNotificationsAsRead($ids: [uuid!]!) {\n    update_notifications(where: { id: { _in: $ids }, readAt: { _is_null: true } }, _set: { readAt: \"now()\" }) {\n      affected_rows\n      returning {\n        id\n        readAt\n      }\n    }\n  }\n": types.MarkNotificationsAsReadDocument,
    "\n  subscription Notifications {\n    notifications(order_by: { createdAt: desc }) {\n      id\n      entityId\n      entityType\n      type\n      readAt\n      link\n      metadata\n      video {\n        id\n        title\n      }\n    }\n  }\n": types.NotificationsDocument,
    "\n  mutation UpsertUserSettings($data: jsonb!) {\n    insert_user_settings_one(\n      object: { data: $data }\n      on_conflict: { constraint: user_settings_pkey, update_columns: [data] }\n    ) {\n      user_id\n      data\n    }\n  }\n": types.UpsertUserSettingsDocument,
    "\n  query GetUserSettings {\n    user_settings {\n      data\n    }\n  }\n": types.GetUserSettingsDocument,
    "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n": types.InsertVideosDocument,
    "\n  mutation CreateSignedUploadUrl($input: SignedUploadUrlInput!) {\n    createSignedUploadUrl(input: $input) {\n      success\n      message\n      dataObject {\n        uploadUrl\n        publicUrl\n        objectPath\n        expiresAt\n      }\n    }\n  }\n": types.CreateSignedUploadUrlDocument,
    "\n  mutation UpdateVideoManage($id: uuid!, $title: String, $thumbnailUrl: String) {\n    update_videos_by_pk(\n      pk_columns: { id: $id }\n      _set: { title: $title, thumbnailUrl: $thumbnailUrl }\n    ) {\n      id\n    }\n  }\n": types.UpdateVideoManageDocument,
    "\n  mutation CreatePlaylistManage(\n    $title: String!\n    $slug: String!\n    $thumbnailUrl: String\n    $description: String\n  ) {\n    insert_playlist_one(\n      object: {\n        title: $title\n        slug: $slug\n        thumbnailUrl: $thumbnailUrl\n        description: $description\n        site: \"watch\"\n      }\n    ) {\n      id\n    }\n  }\n": types.CreatePlaylistManageDocument,
    "\n  mutation UpdatePlaylistManage($id: uuid!, $title: String, $description: String) {\n    update_playlist_by_pk(\n      pk_columns: { id: $id }\n      _set: { title: $title, description: $description }\n    ) {\n      id\n    }\n  }\n": types.UpdatePlaylistManageDocument,
    "\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n": types.SaveSubtitleDocument,
    "\n  mutation SetVideoThumbnailAtTime($input: SetVideoThumbnailAtTimeInput!) {\n    setVideoThumbnailAtTime(input: $input) {\n      success\n      message\n      dataObject {\n        thumbnailUrl\n      }\n    }\n  }\n": types.SetVideoThumbnailAtTimeDocument,
    "\n  mutation sharePlaylist($id: uuid!, $emails: jsonb) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": types.SharePlaylistDocument,
    "\n  mutation shareVideo($id: uuid!, $emails: jsonb) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { sharedRecipientsInput: $emails }) {\n      id\n    }\n  }\n": types.ShareVideoDocument,
    "\n  mutation UpdateVideoThumbnail($id: uuid!, $thumbnailUrl: String!) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { thumbnailUrl: $thumbnailUrl }) {\n      id\n      thumbnailUrl\n    }\n  }\n": types.UpdateVideoThumbnailDocument,
    "\n  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {\n    insert_user_video_history_one(\n      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }\n      on_conflict: {\n        constraint: user_video_history_user_id_video_id_key\n        update_columns: [progress_seconds, last_watched_at]\n      }\n    ) {\n      id\n      progress_seconds\n      last_watched_at\n    }\n  }\n": types.UpdateVideoProgressDocument,
    "\n  fragment UserFields on users {\n    username\n  }\n": types.UserFieldsFragmentDoc,
    "\n  fragment VideoFields on videos {\n    id\n    title\n    description\n    duration\n    thumbnailUrl\n    source\n    slug\n    createdAt\n    user_id\n    user {\n      ...UserFields\n    }\n    user_video_histories {\n      last_watched_at\n      progress_seconds\n    }\n    subtitles {\n      id\n      isDefault\n      lang\n      url\n    }\n  }\n": types.VideoFieldsFragmentDoc,
    "\n  fragment PlaylistVideoFields on playlist_videos {\n    position\n    video {\n      ...VideoFields\n    }\n  }\n": types.PlaylistVideoFieldsFragmentDoc,
    "\n  fragment PlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    user {\n      ...UserFields\n    }\n    playlist_videos(where: { video: { status: { _eq: \"ready\" } } }, order_by: { position: asc }) {\n      ...PlaylistVideoFields\n    }\n  }\n": types.PlaylistFieldsFragmentDoc,
    "\n  query UserVideoHistory {\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n": types.UserVideoHistoryDocument,
    "\n  query PlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...PlaylistFields\n    }\n  }\n": types.PlaylistDetailDocument,
    "\n  query Playlists {\n    playlist(order_by: { createdAt: desc }) {\n      title\n      id\n      slug\n    }\n  }\n": types.PlaylistsDocument,
    "\n  query VideoDetail($id: uuid!) @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    videos_by_pk(id: $id) {\n      id\n      source\n      thumbnailUrl\n      title\n      description\n    }\n  }\n": types.VideoDetailDocument,
    "\n  query AllVideos @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    playlist(\n      where: {\n        playlist_videos_aggregate: { count: { predicate: { _gt: 0 }, filter: { video: { status: { _eq: \"ready\" } } } } }\n      }\n    ) {\n      ...PlaylistFields\n    }\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n      limit: 20\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n": types.AllVideosDocument,
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
export function graphql(source: "\n  query GetJournalByDate($date: date!) {\n    journals(where: { date: { _eq: $date } }, limit: 1) {\n      id\n      user_id\n      date\n      content\n      mood\n      tags\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').GetJournalByDateDocument;
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
export function graphql(source: "\n  mutation CreateListenPlaylist($object: playlist_insert_input!) {\n    insert_playlist_one(object: $object) {\n      id\n      slug\n    }\n  }\n"): typeof import('./graphql').CreateListenPlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePlaylist($id: uuid!, $set: playlist_set_input!) {\n    update_playlist_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n    }\n  }\n"): typeof import('./graphql').UpdatePlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeletePlaylist($id: uuid!) {\n    delete_playlist_by_pk(id: $id) {\n      id\n    }\n  }\n"): typeof import('./graphql').DeletePlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddAudioToPlaylist($object: playlist_audios_insert_input!) {\n    insert_playlist_audios_one(object: $object) {\n      playlist_id\n      audio_id\n      position\n    }\n  }\n"): typeof import('./graphql').AddAudioToPlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveAudioFromPlaylist($playlistId: uuid!, $audioId: uuid!) {\n    delete_playlist_audios_by_pk(playlist_id: $playlistId, audio_id: $audioId) {\n      playlist_id\n      audio_id\n    }\n  }\n"): typeof import('./graphql').RemoveAudioFromPlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReorderPlaylistAudios($updates: [playlist_audios_updates!]!) {\n    update_playlist_audios_many(updates: $updates) {\n      affected_rows\n      returning {\n        playlist_id\n      }\n    }\n  }\n"): typeof import('./graphql').ReorderPlaylistAudiosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateAudio($id: uuid!, $set: audios_set_input!) {\n    update_audios_by_pk(pk_columns: { id: $id }, _set: $set) {\n      id\n    }\n  }\n"): typeof import('./graphql').UpdateAudioDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAudio($id: uuid!) {\n    delete_audios_by_pk(id: $id) {\n      id\n    }\n  }\n"): typeof import('./graphql').DeleteAudioDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AssignFeeling($object: audio_tags_insert_input!) {\n    insert_audio_tags_one(\n      object: $object\n      on_conflict: { constraint: audio_tags_pkey, update_columns: [] }\n    ) {\n      audio_id\n      tag_id\n    }\n  }\n"): typeof import('./graphql').AssignFeelingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnassignFeeling($audioId: uuid!, $tagId: uuid!) {\n    delete_audio_tags_by_pk(audio_id: $audioId, tag_id: $tagId) {\n      audio_id\n      tag_id\n    }\n  }\n"): typeof import('./graphql').UnassignFeelingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AudioFields on audios {\n    id\n    name\n    source\n    thumbnailUrl\n    artistName\n  }\n"): typeof import('./graphql').AudioFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PlaylistAudioFields on playlist_audios {\n    position\n    audio {\n      ...AudioFields\n    }\n  }\n"): typeof import('./graphql').PlaylistAudioFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ListenPlaylistFields on playlist {\n    id\n    title\n    thumbnailUrl\n    slug\n    createdAt\n    description\n    playlist_audios(order_by: { position: asc }) {\n      ...PlaylistAudioFields\n    }\n  }\n"): typeof import('./graphql').ListenPlaylistFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListenHome @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n    playlist(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n    }\n  }\n"): typeof import('./graphql').ListenHomeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListenManage($userId: uuid!) {\n    audios(\n      where: { user_id: { _eq: $userId } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { display_order: asc }\n    ) {\n      id\n      name\n    }\n    playlist(\n      where: { user_id: { _eq: $userId }, site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n      description\n      thumbnailUrl\n    }\n  }\n"): typeof import('./graphql').ListenManageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListenPlaylistDetail($id: uuid!) {\n    playlist_by_pk(id: $id) {\n      ...ListenPlaylistFields\n    }\n  }\n"): typeof import('./graphql').ListenPlaylistDetailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListenPlaylists {\n    playlist(\n      where: { site: { _eq: \"listen\" } }\n      order_by: { createdAt: desc }\n    ) {\n      id\n      title\n      slug\n    }\n  }\n"): typeof import('./graphql').ListenPlaylistsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n      title\n      slug\n      brief\n      markdownContent\n      readTimeInMinutes\n      created_at\n      updated_at\n    }\n  }\n"): typeof import('./graphql').InsertPostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePost($id: uuid!, $object: posts_set_input!) {\n    update_posts_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n      title\n      slug\n      brief\n      markdownContent\n      readTimeInMinutes\n      created_at\n      updated_at\n      status\n    }\n  }\n"): typeof import('./graphql').UpdatePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Post($id: uuid!) {\n    posts_by_pk(id: $id) {\n      title\n      readTimeInMinutes\n      markdownContent\n      id\n      brief\n      slug\n      created_at\n      status\n      visibility\n      pinned\n    }\n  }\n"): typeof import('./graphql').PostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllPosts {\n    posts(order_by: [{ pinned: desc }, { created_at: desc }]) {\n      brief\n      id\n      markdownContent\n      readTimeInMinutes\n      title\n      slug\n      created_at\n      status\n      visibility\n      pinned\n    }\n  }\n"): typeof import('./graphql').AllPostsDocument;
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
export function graphql(source: "\n  mutation UpsertUserSettings($data: jsonb!) {\n    insert_user_settings_one(\n      object: { data: $data }\n      on_conflict: { constraint: user_settings_pkey, update_columns: [data] }\n    ) {\n      user_id\n      data\n    }\n  }\n"): typeof import('./graphql').UpsertUserSettingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserSettings {\n    user_settings {\n      data\n    }\n  }\n"): typeof import('./graphql').GetUserSettingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n"): typeof import('./graphql').InsertVideosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSignedUploadUrl($input: SignedUploadUrlInput!) {\n    createSignedUploadUrl(input: $input) {\n      success\n      message\n      dataObject {\n        uploadUrl\n        publicUrl\n        objectPath\n        expiresAt\n      }\n    }\n  }\n"): typeof import('./graphql').CreateSignedUploadUrlDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateVideoManage($id: uuid!, $title: String, $thumbnailUrl: String) {\n    update_videos_by_pk(\n      pk_columns: { id: $id }\n      _set: { title: $title, thumbnailUrl: $thumbnailUrl }\n    ) {\n      id\n    }\n  }\n"): typeof import('./graphql').UpdateVideoManageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePlaylistManage(\n    $title: String!\n    $slug: String!\n    $thumbnailUrl: String\n    $description: String\n  ) {\n    insert_playlist_one(\n      object: {\n        title: $title\n        slug: $slug\n        thumbnailUrl: $thumbnailUrl\n        description: $description\n        site: \"watch\"\n      }\n    ) {\n      id\n    }\n  }\n"): typeof import('./graphql').CreatePlaylistManageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePlaylistManage($id: uuid!, $title: String, $description: String) {\n    update_playlist_by_pk(\n      pk_columns: { id: $id }\n      _set: { title: $title, description: $description }\n    ) {\n      id\n    }\n  }\n"): typeof import('./graphql').UpdatePlaylistManageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n"): typeof import('./graphql').SaveSubtitleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetVideoThumbnailAtTime($input: SetVideoThumbnailAtTimeInput!) {\n    setVideoThumbnailAtTime(input: $input) {\n      success\n      message\n      dataObject {\n        thumbnailUrl\n      }\n    }\n  }\n"): typeof import('./graphql').SetVideoThumbnailAtTimeDocument;
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
export function graphql(source: "\n  mutation UpdateVideoThumbnail($id: uuid!, $thumbnailUrl: String!) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { thumbnailUrl: $thumbnailUrl }) {\n      id\n      thumbnailUrl\n    }\n  }\n"): typeof import('./graphql').UpdateVideoThumbnailDocument;
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
export function graphql(source: "\n  fragment VideoFields on videos {\n    id\n    title\n    description\n    duration\n    thumbnailUrl\n    source\n    slug\n    createdAt\n    user_id\n    user {\n      ...UserFields\n    }\n    user_video_histories {\n      last_watched_at\n      progress_seconds\n    }\n    subtitles {\n      id\n      isDefault\n      lang\n      url\n    }\n  }\n"): typeof import('./graphql').VideoFieldsFragmentDoc;
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
export function graphql(source: "\n  query AllVideos @cached {\n    videos(\n      where: { _and: { _not: { playlist_videos: {} }, status: { _eq: \"ready\" } } }\n      order_by: { createdAt: desc }\n    ) {\n      ...VideoFields\n    }\n    playlist(\n      where: {\n        playlist_videos_aggregate: { count: { predicate: { _gt: 0 }, filter: { video: { status: { _eq: \"ready\" } } } } }\n      }\n    ) {\n      ...PlaylistFields\n    }\n    user_video_history(\n      where: {\n        _and: {\n          last_watched_at: { _is_null: false }\n          progress_seconds: { _gt: 0 }\n          video: { source: { _is_null: false } }\n        }\n      }\n      order_by: { last_watched_at: desc }\n      limit: 20\n    ) {\n      id\n      last_watched_at\n      progress_seconds\n      video {\n        id\n        title\n        source\n        slug\n        thumbnailUrl\n        duration\n        createdAt\n        user {\n          ...UserFields\n        }\n        playlist_videos {\n          playlist {\n            id\n            slug\n            title\n            thumbnailUrl\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').AllVideosDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
