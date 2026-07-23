const systemConfig = {
  defaultExternalRequestTimeout: 15000,
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

const crawlConfig = {
  defaultWaitForSelectorTimeout: 10000,
};

export {
  QueueName,
  type Queues,
  systemConfig,
  uuidNamespaces,
  queues,
  crawlConfig,
};
