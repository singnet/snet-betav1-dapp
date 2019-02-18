import GRPCV3Service from "./GRPCV3Service";

export default class NullGRPCV3Service extends GRPCV3Service {
  constructor() {
    super('NullService', null)
  }

  get methodNames() {
    return [];
  }

  hasSameName(_serviceName) {
    return false;
  }
}
