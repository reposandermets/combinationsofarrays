//-- phpMyAdmin SQL Dump
//-- version 4.5.2
//-- http://www.phpmyadmin.net
//--
//-- Host: localhost
//-- Generation Time: Jun 25, 2016 at 09:26 PM
//-- Server version: 10.1.10-MariaDB
//-- PHP Version: 7.0.2
//
//SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
//SET time_zone = "+00:00";
//
//--
//-- Database: `keystuff`
//--
//
//-- --------------------------------------------------------
//
//--
//-- Table structure for table `mskeys`
//--
//
//CREATE TABLE `mskeys` (
//  `id` int(11) NOT NULL,
//  `name` varchar(255) COLLATE utf8_bin NOT NULL,
//  `tried` int(11) DEFAULT NULL,
//  `success` int(11) DEFAULT NULL
//) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
//
//--
//-- Indexes for dumped tables
//--
//
//--
//-- Indexes for table `mskeys`
//--
//ALTER TABLE `mskeys`
//  ADD PRIMARY KEY (`id`),
//  ADD UNIQUE KEY `name` (`name`);
//
//--
//-- AUTO_INCREMENT for dumped tables
//--
//
//--
//-- AUTO_INCREMENT for table `mskeys`
//--
//ALTER TABLE `mskeys`
//  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

/**
 * @returns {undefined}
 */
(function () {
    
    /**
     * https://blog.jcoglan.com/2010/08/30/the-potentially-asynchronous-loop/
     * 
     * @param {type} iterator
     * @returns {undefined}
     */
    Array.prototype.asyncEach = function (iterator) {
        var list = this,
            n = list.length,
            i = -1,
            calls = 0,
            looping = false;

        var iterate = function () {
            calls -= 1;
            i += 1;
            if (i === n)
                return;
            iterator(list[i], resume);
        };

        var loop = function () {
            if (looping)
                return;
            looping = true;
            while (calls > 0)
                iterate();
            looping = false;
        };

        var resume = function () {
            calls += 1;
            if (typeof setTimeout === 'undefined')
                loop();
            else
                setTimeout(iterate, 1);
        };
        resume();
    };

    var mysql = require('mysql'),
        pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'keystuff'
        }),
        arrays = [
            ['7'], ['6'], ['K'], ['6'], ['A', 'B', 'D', 'E', 'F', 'H', 'K', 'L', 'M', 'N', 'P', 'R', '2', '6', '8'],
            ['B'], ['4'], ['7'], ['K'], ['D'],
            ['6'], ['G'], ['Q', 'O'], ['H', 'A'], ['7'],
            ['C'], ['R'], ['G', '0', '8', 'D'], ['4'], ['V'],
            ['8'], ['8'], ['D'], ['X'], ['R', 'P']
        ];
    /**
     * http://stackoverflow.com/questions/4331092/finding-all-combinations-of-javascript-array-values
     * 
     * @param {type} arr
     * @returns {Array|view1_L19.allPossibleCases.arr}
     */
    function allPossibleCases(arr) {
        if (arr.length === 1) {

            return arr[0];

        } else {

            var result = [],
                allCasesOfRest = allPossibleCases(arr.slice(1));  // recur with the rest of array

            for (var i = 0; i < allCasesOfRest.length; i++) {
                for (var j = 0; j < arr[0].length; j++) {
                    result.push(arr[0][j] + allCasesOfRest[i]);
                }
            }
            return result;
        }
    }

    var keys = [],
        r = allPossibleCases(arrays);

    for (var i = 0; i < r.length; i++) {
        var key = '';
        for (var u = 0; u < r[i].length; u++) {
            key += r[i][u];
            if ((u + 1) % 5 === 0 && u !== 0 && (u + 1) < r[i].length) {
                key += '-';
            }
        }

        keys.push(key);
    }
    
    /**
     * http://www.luiselizondo.net/how-to-write-a-big-loop-on-node-js/
     * 
     * @param {function} callback
     * @returns {undefined}
     */
    function init(callback) {

        var total = keys.length,
            counter = 0,
            pre;

        pool.getConnection(function (err, connection) {
            keys.asyncEach(function (item, resume) {
                connection.query('SELECT * FROM `mskeys` WHERE name = ?', [item], function (err, result) {
                    counter++;
                    if (counter < 10) {
                        pre = '00' + String(counter);
                    } else if (counter < 100) {
                        pre = '0' + String(counter);
                    } else {
                        pre = String(counter);
                    }
                    var data = {
                        name: item
                    };
                    if (result.length === 0) {
                        //console.log(pre, 'Insert', item);
                        connection.query('INSERT INTO `mskeys` SET ?', data, function (err, result) {
                            if (counter < total) {
                                resume();
                            } else {
                                return callback();
                            }
                        });
                    } else {
                        //console.log(pre, 'Exists', item);
                        if (counter < total) {
                            resume();
                        } else {
                            return callback();
                        }
                    }
                });
            });
        });
    }

    init(function () {
        process.exit();
    });

}());