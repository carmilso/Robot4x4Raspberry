#!/usr/bin/env python
# -*- coding: utf-8 -*-


import base64
from private import dataBaseConfig as dbc
from config import driversL298N as drivers


def main():
    print 'Testing Robot...\n'

    robot = drivers.Robot(17, 27, 10, 9, 1)

#   robot.initDB(dbc.IP, dbc.USER, base64.b64encode(dbc.PASSWORD), dbc.DB)

    robot.fordwardRobot(7)
    robot.rightRobot(5)
    robot.leftRobot(5)
    robot.backwardRobot(7)


if __name__ == '__main__':
    main()
