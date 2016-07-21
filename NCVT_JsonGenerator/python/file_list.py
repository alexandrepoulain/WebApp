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
    elif script.endswith(('.py', '.R', '.r', '.m')):
        list_token = parameters_py(script)
    elif script.endswith('.cmd'):
        list_token = options_cmd(script)
    return list_token


def options_cmd(script):
    """ create a list of options for the tool

    Parameter
    ---------
    script: str
        the full path to the script

    Return
    ------
    list_options: list
        list of options
    """
    list_tool = ['mensia-mattool', 'mensia-covtool', 'mensia-ajdtool',
                 'mensia-kmeanstool', 'mensia-meanshifttool']
    tool = ''
    # open the script and find the name of the tool
    with open(script, 'r') as script_file:
        for line in script_file:
            line = line.split()
            # check the line
            for elem in line:
                if elem in list_tool:
                    tool = elem
    # normaly we have the tool but let's test it
    if tool == 'mensia-mattool':
        list_available_options = ['--help', '--output']

    elif tool == 'mensia-covtool':
        list_available_options = ['--help', '--output', '--max-iterations',
                                  '--trace-normalization-input',
                                  '--det-normalization-input',
                                  '--riemannian', '--euclidean',
                                  '--trace-normalization-output',
                                  '--det-normalization-output']

    elif tool == 'mensia-ajdtool':
        list_available_options = ['--help', '--output-forward',
                                  '--output-backward',
                                  '--inputs', '--dimension-reduction']

    elif tool == 'mensia-kmeanstool':
        list_available_options = ['--help', '--output', '--k-count',
                                  '--max-iterations',
                                  '--trace-normalization-input',
                                  '--det-normalization-input',
                                  '--riemannian', '--euclidean',
                                  '--trace-normalization-output',
                                  '--det-normalization-output']

    elif tool == 'mensia-meanshifttool':
        list_available_options = ['--help', '--output', '--bandwith',
                                  '--max-iterations', '--threshold-norm',
                                  '--trace-normalization-input',
                                  '--det-normalization-input',
                                  '--trace-normalization-output',
                                  '--det-normalization-output']
    # If the tool isn't one of those we know we check just input and
    # output
    else:
        list_available_options = ['--inputs',
                                  '--outputs', '--input', '--output']
    return list_available_options


def create_json(list_script, selection):
    """ create a json file with the scripts of the directory
            this .json will be saved in the temp folder


        Parameters
        ----------
        list_script: list
            the list of the scripts of the folder
        selection: dict
            dict of selections available for the database

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
    data['Selection'] = selection
    print(data)
    with open('../client/temp/list_script.json', 'w') as outfile:
        json.dump(data, outfile)


def check_database(csv_file, column_separator=';'):
    """ check the database return the name of the column
    and the selection available for each column

    Parameter:
    ----------
    csv_file: str
        the path to the csv file
    Return
    ------
    dict_database: dict
        each key is associated to the name of a column
        each value is a list of selection available for this key/column
    """
    list_selection = []
    list_column = []
    dicti = {}
    # open the database
    with open(csv_file, 'r') as csv_database:
        # we take the first line
        list_keys = csv_database.readline().strip().split(
            column_separator)
        for line in csv_database:

            line = line.strip().split(column_separator)

            # initialisation
            for i in range(len(list_keys)):
                list_column.append([])
                list_selection.append([])
            # we take the column
            for i in range(len(list_keys)):
                list_column[i].append(line[i])
    # now we make the selection
    for i in range(len(list_keys)):
        for elem in list_column[i]:
            if elem not in list_selection[i]:
                list_selection[i].append(elem)
        dicti[list_keys[i]] = list_selection[i]
    del dicti['FileName']
    list_dict = []
    print(dicti)
    for key, value in dicti.items():
        for elem in value:
            new_dict = {}
            new_dict[key] = elem
            list_dict.append(new_dict)
    return list_dict


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
            # get the name of the scripts
            if file.endswith(('.py', '.cmd', '.xml', '.mxs')):
                list_script.append(file)
            # get the name of the config file
            if file.endswith('.csv'):
                csv_file = file
        selection = check_database(csv_file)
        create_json(list_script, selection)
    except:
        raise ValueError("abording ...")

path = input('Enter the path of your directory: ')
open_files(path)
# take the name of the json file for output
file_name = input('Enter the name of the output json file: ')
# open a txt in temp and put in it the pathe of the directory and the
# name of the json file
with open('../client/temp/info.txt', 'w') as info_file:
    info_file.write('path=' + path + '\n')
    info_file.write('name=' + file_name)
