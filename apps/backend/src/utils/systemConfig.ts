const systemConfig = {
  defaultExternalRequestTimeout: 5000,
};

const uuidNamespaces = {
  cloudTask: 'abd32375-5036-44a1-bc75-c7bb33051b99',
};

enum QueueName {
  StreamVideo = 'stream-video',
  ConvertVideo = 'convert-video',
}

const queues = {
  streamVideoQueue: QueueName.StreamVideo,
  convertVideoQueue: QueueName.ConvertVideo,
};
type Queues = typeof queues;

export { QueueName, Queues, systemConfig, uuidNamespaces, queues };
