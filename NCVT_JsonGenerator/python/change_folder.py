####################################
# MENSIA TECHNOLOGIES CONFIDENTIAL
# ________________________________
#
#  [2012] - [2014] Mensia Technologies SA
#  Copyright, All Rights Reserved.
#
# NOTICE: All information contained herein is, and remains
# the property of Mensia Technologies SA.
# The intellectual and technical concepts contained
# herein are proprietary to Mensia Technologies SA
# and are covered copyright law.
# Dissemination of this information or reproduction of this material
# is strictly forbidden unless prior written permission is obtained
# from Mensia Technologies SA.
####################################

# open the info.txt file and find the name of the file saved
with open('../client/temp/info.txt', 'r') as info_file:
	path = info_file.readline().strip()
	print(path)
