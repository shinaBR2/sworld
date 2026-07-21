import type { HashnodeBodySchema } from 'src/schema/hashnode';
import { getPost } from 'src/services/hashnode/queries/posts';
import { deletePost } from 'src/services/hasura/mutations/posts/delete';
import { insertPost } from 'src/services/hasura/mutations/posts/insert';
import { updatePost } from 'src/services/hasura/mutations/posts/update';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS, VALIDATION_ERRORS } from 'src/utils/error-codes';
import { AppResponse } from 'src/utils/schema';

const fetchPost = async (hId: string) => {
  const postDetail = await getPost(hId);

  if (!postDetail) {
    throw CustomError.high('Post not found', {
      shouldRetry: false,
      errorCode: VALIDATION_ERRORS.INVALID_PAYLOAD,
      context: {
        hId,
      },
      source: 'apps/gateway/hashnode/routes/posts/index.ts',
    });
  }

  return postDetail;
};

const postEventsHandler = async (validatedData: HashnodeBodySchema) => {
  const { eventType, post } = validatedData.data;
  const { id: hId } = post;

  try {
    if (eventType === 'post_published') {
      const postDetail = await fetchPost(hId);

      const { title, brief, content, readTimeInMinutes, slug } = postDetail;

      await insertPost({
        hId,
        title,
        brief,
        markdownContent: content.markdown,
        readTimeInMinutes,
        slug,
      });
    } else if (eventType === 'post_updated') {
      const postDetail = await fetchPost(hId);

      const { title, brief, content, readTimeInMinutes, slug } = postDetail;

      await updatePost(hId, {
        title,
        brief,
        markdownContent: content.markdown,
        readTimeInMinutes,
        slug,
      });
    } else if (eventType === 'post_deleted') {
      await deletePost(hId);
    } else {
      throw CustomError.high('Invalid event type', {
        shouldRetry: false,
        errorCode: VALIDATION_ERRORS.INVALID_PAYLOAD,
        context: {
          body: validatedData,
        },
        source: 'apps/gateway/hashnode/routes/posts/index.ts',
      });
    }

    return AppResponse(true, 'ok');
  } catch (error) {
    throw CustomError.high('Failed to process post event', {
      shouldRetry: true,
      errorCode: HTTP_ERRORS.SERVER_ERROR,
      context: {
        error,
        body: validatedData,
      },
      source: 'apps/gateway/hashnode/routes/posts/index.ts',
    });
  }
};

export { postEventsHandler };
