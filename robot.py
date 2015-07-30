#!/usr/bin/env python
# -*- coding: utf-8 -*-


import base64
import driversL298N as drivers

IP = '192.168.1.9'
USER = 'robot'
PASSWORD = '487092'
DB = 'robotDB'


def main():
    print 'Testing Robot...\n'

    robot = drivers.Robot(17, 27, 10, 9, 1)

    robot.initDB(IP, USER, base64.b64encode(PASSWORD), DB)

    robot.fordwardRobot(7)
    robot.rightRobot(5)
    robot.leftRobot(5)
    robot.backwardRobot(7)


if __name__ == '__main__':
    main()
