class Task {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.level = 0
        this.maxLevel = 0 
        this.xp = 0

        this.xpMultipliers = []
    }

    getMaxXp() {
        var maxXp = Math.round(this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level))
        return maxXp
    }

    getXpLeft() {
        return Math.round(this.getMaxXp() - this.xp)
    }

    getMaxLevelMultiplier(name) {
        var maxLevelMultiplier = 1 + this.maxLevel / 10
        return name ? "Max level" : maxLevelMultiplier
    }

    getXpGain() {
        return applyMultipliers(10, this.xpMultipliers)
    }

    increaseXp() {
        this.xp += applySpeed(this.getXpGain())
        if (this.xp >= this.getMaxXp()) {
            this.levelUp()
        }
    }

    levelUp() {
        var excess = this.xp - this.getMaxXp()
        while (excess >= 0) {
            this.level += 1
            excess -= this.getMaxXp()
        }
        this.xp = this.getMaxXp() + excess
    }
}

class Job extends Task {
    constructor(baseData) {
        super(baseData)   
        this.incomeMultipliers = []
    }

    getLevelMultiplier(name) {
        var levelMultiplier = 1 + Math.log10(this.level + 1)
        return name ? "Level" : levelMultiplier
    }
    
    getIncome() {
        return applyMultipliers(this.baseData.income, this.incomeMultipliers) 
    }
}

class Skill extends Task {
    constructor(baseData) {
        super(baseData)
    }

    getEffect(name) {
        var effect = 1 + this.baseData.effect * this.level
        return name ? this.baseData.name : effect
    }

    getEffectDescription() {
        var description = this.baseData.description
        var text = "x" + String(this.getEffect().toFixed(2)) + " " + description
        return text
    }
}

class Item {
    constructor(baseData) {  
        this.baseData = baseData
        this.name = baseData.name
        this.expenseMultipliers = []
    }

    getEffect(name) {
        if (gameData.currentProperty != this && !gameData.currentMisc.includes(this)) return 1
        var effect = this.baseData.effect
        return name ? this.baseData.name : effect
    }

    getEffectDescription() {
        var description = this.baseData.description
        if (itemCategories["Properties"].includes(this.name)) description = "Happiness"
        var text = "x" + this.baseData.effect.toFixed(1) + " " + description
        return text
    }

    getExpense() {
        return applyMultipliers(this.baseData.expense, this.expenseMultipliers)
    }
}

class Requirement {
    constructor(elements, requirements) {
        this.elements = elements
        this.requirements = requirements
        this.completed = false

        if (gameData.taskData[elements] || gameData.itemData[elements]) {
            this.elements = [rows["rows"][elements]]
        }
    }

    isCompleted() {
        if (this.completed) {return true}
        
        for (var requirement of this.requirements) {
            if (!this.getCondition(requirement)) {
                return false
            }
        }

        this.completed = true
        return true
    }
}

class TaskRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "task"
    }

    getCondition(requirement) {
        return gameData.taskData[requirement.task].level >= requirement.requirement
    }
}

class CoinRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "coins"
    }

    getCondition(requirement) {
        return gameData.coins >= requirement.requirement
    }
}

class AgeRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "age"
    }

    getCondition(requirement) {
        return daysToYears(gameData.days) >= requirement.requirement
    }
}

class EvilRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "evil"
    }

    getCondition(requirement) {
        return gameData.evil >= requirement.requirement
    }    
}

class Milestone {
    constructor(taskName, level, requirements) {
        this.taskName = taskName
        this.level = level
        this.requirements = requirements
        
        this.completed = false
    }

    getCondition(requirement) {
        return gameData.taskData[requirement.task].level >= requirement.requirement
    }

    isCompleted() {
        if (this.completed) {return true}
        
        for (var requirement of this.requirements) {
            if (!this.getCondition(requirement)) {
                return false
            }
        }

        this.completed = true
        return true
    }

    setEntityLevel() {
        if (this.isCompleted()) {
            gameData.taskData[this.taskName].level = this.level
        }
    }
}