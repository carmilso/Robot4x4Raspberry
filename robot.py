#!/usr/bin/env python
# -*- coding: utf-8 -*-


from time import sleep
from config import driversL298N as drivers



def main():
    robot = drivers.Robot(17, 27, 10, 9, 0)

    operations = {'up': robot.fordwardRobot(), 'down': robot.backwardRobot(), 'right': robot.rightRobot(), 'left': robot.leftRobot(), 'stop': robot.stopRobot()}

    while True:
        order = raw_input()
        print order

        if order == 'close': break

        operations[order]
        sleep(0.25)


if __name__ == '__main__':
    main()
