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
import os
import json
import re


def parse_line_py(line):
    """ find the parameters in line
    Parameters
    ----------
    line: str
        a line of the .py file

    Returns
    -------
    list:
        the list of parameters of the .py file
    """
    # hypothesis : no space in the name of the parameter in the .py file
    # The parameters found are in inverted commas
    list_parameter_line = re.findall(r".\'([\w\-]+)\'.", line)

    return list_parameter_line


def parameters_py(filename):
    """ find the parameters in a .py file

    Parameters
    ----------
    filename: str
        the name of the .py file

    Returns
    -------
    list:
        the list of the parameters
    """
    liste_parameters = []
    with open(filename, 'r') as py_file:
        for line in py_file:
            line = line.strip()
            parameters = parse_line_py(line)
            liste_parameters.extend(parameters)
    return liste_parameters


def parse_line_xml(line):
    """ find the tokens in a line of the xml/mxs file

    Parameters
    ----------
    line: str
        a line of the xml/mxs file

    Returns
    -------
    list:
        the list of tokens
    """
    # This is an example to understand what contain token3, token1 and token2:
    # considering a string  "${token1 ${token2 ${token4}}} ${token3}"
    # In description of each regular expression ... = letters + numbers +
    # indents but not '$' or '}'

    line = line.strip()
    # here we find token3 and token4 because we ask to have a sequence ${ ... }
    token3 = re.findall(r"\$\{([\w\s\-\(\)]+)\}", line)
    # here we find token1 because we expect the sequence is framed by ${...$
    token1 = re.findall(r"\$\{([\w\s\-\(\)]+)\$", line)
    # here find token2 because we expect that sequence is framed by
    # anything_before ${...$
    token2 = re.findall(r".\$\{([\w\s\-\(\)]+)\$", line)

    # here we return a list with all the lists token1 + token2 + token3
    return token1 + token2 + token3


def token_xml(name_xml):
    """ find the tokens in a xml/mxs file

    Parameters
    ----------
    name_xml: str
        the name of the xml/mxs file

    Returns
    -------
    list:
        the list of the tokens
    """
    list_token = []
    # Opening
    with open(name_xml, "r") as xml_file:
        for line in xml_file:
            # take the tokens in a line
            token = parse_line_xml(line)
            # if the line contain token we put them in the list
            if token is not None:
                list_token = list_token + token
    return list_token


def parse_script(script):
    """ create a list with the token of the script
        we parse the script in order to find the token
        and make a list of them

    Parameters
    ----------
    script: string
        the path to the script

    Returns
    -------
    list of token: list
    """
    list_token = []
    # opening the script
    if script.endswith('.mxs') or script.endswith('.xml'):
        list_token = token_xml(script)
    elif script.endswith('.py'):
        list_token = parameters_py(script)
    return list_token


def create_json(list_script):
    """ create a json file with the scripts of the directory
            this .json will be saved in the temp folder


        Parameters
        ----------
        list_script: list
            the list of the scripts of the folder

        Returns
        -------
        nothing
    """
    list_token = []
    data = {}
    # first we parse the name
    for script in list_script:
        # before the splitting we have to check the token
        list_token = parse_script(script)
        script = script.split('/')
        script = script[-2] + '/' + script[-1]
        print(script)
        data[script] = list_token
    print(data)
    with open('../client/temp/list_script.json', 'w') as outfile:
        json.dump(data, outfile)


def open_files(path):
    """  open the folder and make lists of files

    Parameters
    ----------
    path: string
        the path of the directory

    Returns
    -------
    nothing
    """
    list_file = []
    list_script = []
    try:
        for root, dirs, files in os.walk(path, topdown=False):
            for name in files:
                list_file.append(os.path.join(root, name))
        for file in list_file:
            if file.endswith('.py') or file.endswith('.cmd') or file.endswith('.xml') or file.endswith('.mxs'):
                list_script.append(file)
        create_json(list_script)
    except:
        raise ValueError("abording ...")

path = input("Enter the path of your directory")
open_files(path)
