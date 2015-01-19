# Haskoin Wallet Graphical User Interface Demo

Demo of a Web graphic user interface to manage [haskoin-wallet](https://github.com/haskoin/haskoin-wallet) with BIP32 and multisig support.

## Features

This package provides a web user interface for a SPV (simple payment verification) wallet implementation. At the moment, it is not meant to be used as a web wallet service. It is not using an authenticated API yet. You can use it as a local graphic user interface for haskoin wallet. A live demo over the testnet is running [here](http://wallet.pernas.cat).  

## Installing

### Prerequisites for haskoin

```sh
# Debian/Ubuntu installation
sudo apt-get update
sudo apt-get install cabal-install libleveldb-dev libsnappy-dev zlib1g-dev
sudo apt-get install libzmq3-dev
```

The last [haskoin](https://github.com/haskoin/haskoin) and [haskoin-wallet](https://github.com/haskoin/haskoin-wallet) are not serving the un-authenticated API. Hence, to try this GUi you have to install a branch. 

### Install haskoin

Clone the tagged haskoin repositories.

```sh 
git clone -b gui-patch https://github.com/pernas/haskoin
git clone -b gui-patch https://github.com/pernas/haskoin-wallet
```

Install haskoin for the testnet.

```sh
cabal install haskoin --flags=testnet
cabal install haskoin-wallet
```

### Config

Run hw to create the config files.

```sh
hw start -d
hw stop
```

Edit the config file.

```sh
edit ~/.hw/testnet/hw.yaml
```
- delete token: ... line
- delete secret: ... line

### Install GUI

```sh
cd .hw/testnet
rm -rf html
git clone https://github.com/pernas/haskoin-web-GUI.git html
``

### Run

```sh
hw start -d
```

### Access to GUI

```
http://localhost:18555/static/index.html
```