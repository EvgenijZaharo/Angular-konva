import { CircleConfig } from 'konva/lib/shapes/Circle';
import { GroupConfig } from 'konva/lib/Group';
import { LineConfig } from 'konva/lib/shapes/Line';


const stickmanHeight = 70;
const stickmanArmLength = 40;
const GRAVITY = 400;
const JUMP_VELOCITY = 250;

const stickmanHead: CircleConfig = {
  x: 50,
  y: 50,
  radius: 15,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 2,
};

const headX = stickmanHead.x!;
const headRadius = stickmanHead.radius!;
const headY = stickmanHead.y! + headRadius;

const physicStikmanArm = {
  leftAngle: Math.PI / 6,
  rightAngle: -Math.PI / 6,
  leftDirection: -1,
  rightDirection: 1,
  shoulder: { x: headX, y: headY + stickmanHeight / 2 - 10 },
  leftHand: { x: headX - stickmanArmLength, y: headY + stickmanHeight / 2 - 10 },
  rightHand: { x: headX + stickmanArmLength, y: headY + stickmanHeight / 2 - 10 },
  angularSpeed: 3.5,
};

const stickmanBody: LineConfig = {
  points: [headX, headY, headX, headY + stickmanHeight],
  stroke: 'black',
  strokeWidth: 4,
};


const stickmanLeftArm: LineConfig = {
  points: [physicStikmanArm.shoulder.x, physicStikmanArm.shoulder.y, physicStikmanArm.leftHand.x, physicStikmanArm.leftHand.y],
  stroke: 'black',
  strokeWidth: 3,
};

const stickmanRightArm: LineConfig = {
  points: [physicStikmanArm.shoulder.x, physicStikmanArm.shoulder.y, physicStikmanArm.rightHand.x, physicStikmanArm.rightHand.y],
  stroke: 'black',
  strokeWidth: 3,
};

const stickmanRightLeg: LineConfig = {
  points: [headX, headY + stickmanHeight, headX + stickmanArmLength, headY + stickmanHeight + stickmanArmLength],
  stroke: 'black',
  strokeWidth: 5,
};

const stickmanLeftLeg: LineConfig = {
  points: [headX, headY + stickmanHeight, headX - stickmanArmLength, headY + stickmanHeight + stickmanArmLength],
  stroke: 'black',
  strokeWidth: 5,
};

const stickmanConfig: GroupConfig = {
  x: 10,
  y: 10,
  draggable: true,
};

const physicalStickman = {
  position: { x: 0, y: 0 },
  velocity: 15,
  height: 0,
  width: 0,
};

export const STICKMAN_CONFIGS = {
  head: stickmanHead,
  body: stickmanBody,
  leftArm: stickmanLeftArm,
  rightArm: stickmanRightArm,
  leftLeg: stickmanLeftLeg,
  rightLeg: stickmanRightLeg,
  group: stickmanConfig,
  physicArm: physicStikmanArm,
  physical: physicalStickman,
  headY,
  arm: stickmanArmLength,
  gravity: GRAVITY,
  height: stickmanHeight,
  jumpVelocity: JUMP_VELOCITY,
};
