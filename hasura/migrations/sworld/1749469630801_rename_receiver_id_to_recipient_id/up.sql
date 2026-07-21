UPDATE shared_video_recipients 
SET recipient_id = receiver_id 
WHERE receiver_id IS NOT NULL;
