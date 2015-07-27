#!/usr/bin/env python
# -*- coding: utf-8 -*-

import driversL298N as drivers


def main():
    robot = drivers.Robot(17, 27, 10, 9, 1)

    robot.fordwardRobot(7)
    robot.rightRobot(5)
    robot.leftRobot(5)
    robot.backwardRobot(7)


if __name__ == '__main__':
    main()
