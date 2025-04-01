export interface DroneComponentInterface{
  id: number;
  description: string;
  enabled: boolean;
  deleted: boolean;
  componentType: string;
  componentStatus: string;
  componentStatusDetails: string;
  componentStatusDate: string;
}

export interface DroneAnagraphInterface {
  id?: number;
  name: string,
  size: string;
  power: string;
  description: string;
  enabled: number;
  deleted: number;
  components: {
    topLeftMotor?: DroneComponentInterface;
    topRightMotor?: DroneComponentInterface
    bottomLeftMotor?: DroneComponentInterface
    bottomRightMotor?: DroneComponentInterface
    topLeftArm?: DroneComponentInterface
    topRightArm?: DroneComponentInterface
    bottomLeftArm?: DroneComponentInterface
    bottomRightArm?: DroneComponentInterface
    topPlate?: DroneComponentInterface
    bottomPlate?: DroneComponentInterface
    midPlate?: DroneComponentInterface
    cameraPlateLeft?: DroneComponentInterface
    cameraPlateRight?: DroneComponentInterface
    fcModule?: DroneComponentInterface
    escModule?: DroneComponentInterface
    camera?: DroneComponentInterface
    cameraTx?: DroneComponentInterface
    cameraAntenna?: DroneComponentInterface
    cameraAntennaLeft?: DroneComponentInterface
    cameraAntennaRight?: DroneComponentInterface
    elrsModule?: DroneComponentInterface
  }
}
