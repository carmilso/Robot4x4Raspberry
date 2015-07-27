#!/usr/bin/env python
# -*- coding: utf-8 -*-

import driversL298N as drivers


def main():
    robot = drivers.Robot(17, 27, 10, 9, 1)

    robot.fordwardRobot(3)
    robot.rightRobot(2)
    robot.backwardRobot(3)


if __name__ == '__main__':
    main()
