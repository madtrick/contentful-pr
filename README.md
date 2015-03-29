# SPR

`spr` is a small command line utility that includes some goodies to streamline the creation of pull requests in Github.


## Installation

```
npm install -g spr
```

## Usage

```bash
$spr -h

Options:
  -b, --base      Specify the base branch to merge the pull request into
  -h, --help      This help
  -v, --verbose   Be verbose
  -t, --template  Path to template to be used in pull request description
```

### Configuration

`spr` needs some configuration properties to run. It'll look for a file in `$HOME/.spr` which the following structure:

```json
$cat $HOME/.spr

{
  "credentials": {
    "github": {
      "type": "oauth",
      "token": ""
    }
  }
}
```

You can read [this article](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) about how to create Github oauth tokens for command line use.

### Plugins
Extend `spr`'s functionallity including some of the available plugins. To include a plugin add it to the list on its configuration file. A plugin can be included using its name or an object in case yo need to pass some configuration values to it. Below there's an example:

```
$ cat $HOME/.spr
{
  ...
  "plugins": [
    "spr-changelog",
    "spr-assign",
    {
      "package": "spr-target-process",
      "config": {
          "domain": "",
          "username": "",
          "password": ""
        }
    }
  ]
}

```
#### Existing plugins

* [spr-target-process](https://github.com/madtrick/spr-target-process). Include the id of a TP ticket in the PR description and comment on TP entities
* [spr-assign](https://github.com/madtrick/spr-assign). Assign the pull request to someone
* [spr-changelog](https://github.com/madtrick/spr-changelo). Include the upcoming changes in the pull request description
