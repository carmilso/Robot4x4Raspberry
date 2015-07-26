#!/usr/bin/env python
# -*- coding: utf-8 -*-

import RPi.GPIO as GPIO
import time


class Robot:
	def __init__(self, in1, in2, in3, in4, debug=0):
		self.MOTOR_R = (in1, in2)
		self.MOTOR_L = (in3, in4)
		self.MOTORS = (in1, in2, in3, in4)
		self.DEBUG = debug

		GPIO.setmode(GPIO.BCM)

		for i in self.MOTORS:
			GPIO.setup(i, GPIO.OUT)

	def __del__(self):
		GPIO.cleanup()
		if self.DEBUG: print 'Robot finished.'

	def __str__(self):
		rob = '''
				IN1 -> %s
				IN2 -> %s
				IN3 -> %s
				IN4 -> %s
			''' % self.MOTORS
		return rob

	def stopMotor(self, motor):
		for input in motor:
			GPIO.output(input, False)
		if self.DEBUG: print "Motor stopped"

	def fordwardMotor(self, motor):
		for i in range(len(motor)):
			mov = False if i % 2 == 0 else True
			GPIO.output(motor[i], mov)
		if self.DEBUG: print 'Motor fordwarding'

	def backwardMotor(self, motor):
		for i in range(len(motor)):
			mov = True if i % 2 == 0 else False
			GPIO.output(motor[i], mov)
		if self.DEBUG: print 'Motor backwarding'

	def stopRobot(self):
		stopMotor(self.MOTORS)

	def fordwardRobot(self):
		fordwardMotor(self.MOTORS)

	def backwardRobot(self):
		backwardMotor(self.MOTORS)

	def rightRobot(self):
		backwardMotor(self.MOTOR_R)
		fordwardMotor(self.MOTOR_L)

	def leftRobot(self):
		backwardMotor(self.MOTOR_L)
		fordwardMotor(self.MOTOR_R)
