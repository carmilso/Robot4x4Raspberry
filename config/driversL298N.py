#!/usr/bin/env python
# -*- coding: utf-8 -*-


import time
import base64
import MySQLdb
import RPi.GPIO as GPIO


class Robot:
	def __init__(self, in1, in2, in3, in4, debug=0):
		self.MOTOR_R = (in1, in2)
		self.MOTOR_L = (in3, in4)
		self.MOTORS = (in1, in2, in3, in4)
		self.DEBUG = debug
		self.DB = None

		GPIO.setmode(GPIO.BCM)

		for i in self.MOTORS:
			GPIO.setup(i, GPIO.OUT)

	def __del__(self):
		GPIO.cleanup()
		if self.DB is not None: self.DB.close()
		if self.DEBUG: print '\nRobot finished.'

	def __str__(self):
		rob = '''
				IN1 -> %s
				IN2 -> %s
				IN3 -> %s
				IN4 -> %s
			''' % self.MOTORS
		return rob

	def initDB(self, address, username, password, db):
		try:
			self.DB	= MySQLdb.connect (\
					address, \
					username, \
					base64.b64decode(password), \
					db, \
					connect_timeout=3\
			).cursor()
		except MySQLdb.Error as e:
			print 'Not possible to connect to the DataBase', e

	def stopMotor(self, motor):
		for input in motor:
			GPIO.output(input, False)

	def fordwardMotor(self, motor):
		for i in range(len(motor)):
			mov = False if i % 2 == 0 else True
			GPIO.output(motor[i], mov)

	def backwardMotor(self, motor):
		for i in range(len(motor)):
			mov = True if i % 2 == 0 else False
			GPIO.output(motor[i], mov)

	def stopRobot(self):
		if self.DEBUG: print 'Robot stopped'
		self.stopMotor(self.MOTORS)
		time.sleep(0.25)

	def fordwardRobot(self, seconds):
		if self.DEBUG: print 'Robot fordwarding (%ss)' % seconds
		self.fordwardMotor(self.MOTORS)
		time.sleep(seconds)
		self.stopRobot()

	def backwardRobot(self, seconds):
		if self.DEBUG: print 'Robot backwarding (%ss)' % seconds
		self.backwardMotor(self.MOTORS)
		time.sleep(seconds)
		self.stopRobot()

	def rightRobot(self, seconds):
		if self.DEBUG: print 'Robot turning right (%ss)' % seconds
		self.backwardMotor(self.MOTOR_R)
		self.fordwardMotor(self.MOTOR_L)
		time.sleep(seconds)
		self.stopRobot()

	def leftRobot(self, seconds):
		if self.DEBUG: print 'Robot turning left (%ss)' % seconds
		self.backwardMotor(self.MOTOR_L)
		self.fordwardMotor(self.MOTOR_R)
		time.sleep(seconds)
		self.stopRobot()
