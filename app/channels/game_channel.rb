class GameChannel < ApplicationCable::Channel

  attr_accessor :user_id

  @@grid_max_y = 40
  @@grid_max_x = 40
  @@snake_start_length = 10
  @@users = {}
  @@all_snakes = {}
  @@food = []

  def subscribed
    stream_from "all_players"
    self.user_id = params[:user_id]
    puts "subscribed #{self.user_id}"
    @@users[params[:user_id]] = {:score => @@snake_start_length}
    puts @@users

  end

  puts "class starting"

  def unsubscribed
    puts @@users
    # Any cleanup needed when channel is unsubscribed
    @@users.delete(self.user_id)
    @@all_snakes.delete(self.user_id)
    puts "unsubscribed #{self.user_id}"
  end

  def direction data
    # @@users[self.user_id][:direction] = data
    puts "user #{self.user_id} changing direction to #{data["keySent"]}"
    if data["keySent"] == 39 ||  data["keySent"] == 68
      if @@all_snakes[self.user_id][:prevdirection] != 'nx'
        @@all_snakes[self.user_id][:direction] = 'px'
      end
    elsif data["keySent"] == 37 ||  data["keySent"] == 65
      if @@all_snakes[self.user_id][:prevdirection] != 'px'
        @@all_snakes[self.user_id][:direction] = 'nx'
      end
    elsif data["keySent"] == 38 ||  data["keySent"] == 87
      if @@all_snakes[self.user_id][:prevdirection] != 'py'
        @@all_snakes[self.user_id][:direction] = 'ny'
      end
    elsif data["keySent"] == 40 ||  data["keySent"] == 83
      if @@all_snakes[self.user_id][:prevdirection] != 'ny'
        @@all_snakes[self.user_id][:direction] = 'py'
      end
    end


    # ActionCable.server.broadcast("all_snakes", @users)
    # puts data
  end

  def add_snake

    puts "user #{self.user_id} making a snake!"

    @@users[params[:user_id]] = {:score => @@snake_start_length}

    dummy_snake = {}
    dummy_snake[:coords] = []
    dummy_snake[:dead] = false

    randx = rand(@@snake_start_length..@@grid_max_x - @@snake_start_length)
    randy = rand(@@snake_start_length..@@grid_max_y - @@snake_start_length)

    dummy_snake[:coords][0] = {:x => randx, :y => randy}

    if randx < 0.5 * @@grid_max_x 
      dummy_snake[:direction] = "px"
      dummy_snake[:prevdirection] = "px"
    else
      dummy_snake[:direction] = "nx"
      dummy_snake[:prevdirection] = "nx"
    end

    for i in 1..@@snake_start_length-1 do
      if dummy_snake[:direction] == "px"
        dummy_snake[:coords] << {:x => dummy_snake[:coords][-1][:x] - 1, :y => dummy_snake[:coords][-1][:y]}
      elsif dummy_snake[:direction] == "nx"
        dummy_snake[:coords] << {:x => dummy_snake[:coords][-1][:x] + 1, :y => dummy_snake[:coords][-1][:y]}
      end

    end

    puts dummy_snake[:coords]

    @@all_snakes[self.user_id] = dummy_snake


    # ActionCable.server.broadcast("all_players", {:type => 'all_snakes', :snakes => @@all_snakes}.to_json)

  end

  def change_colour data
    puts "user #{self.user_id} changing direction to #{data["snake_colour"]}"
    @@users[self.user_id][:colour] = data["snake_colour"]
  end

  Thread.new do
    Rails.application.executor.wrap do
      loop do
        # puts "looping"

        @@all_snakes.each do |key, value|
          # puts "user #{key} has snakes entry #{value}"
          
          # moving each snake
          #only moves forward and collision checks if alive
          if @@all_snakes[key][:dead] == false
            #creates new head
            if @@all_snakes[key][:direction] == 'px'
              @@all_snakes[key][:prevdirection] = 'px'
              @@all_snakes[key][:coords].unshift({:x => @@all_snakes[key][:coords][0][:x] + 1, :y => @@all_snakes[key][:coords][0][:y]})
            elsif @@all_snakes[key][:direction] == 'nx'
              @@all_snakes[key][:prevdirection] = 'nx'
              @@all_snakes[key][:coords].unshift({:x => @@all_snakes[key][:coords][0][:x] - 1, :y => @@all_snakes[key][:coords][0][:y]})
            elsif @@all_snakes[key][:direction] == 'py'
              @@all_snakes[key][:prevdirection] = 'py'
              @@all_snakes[key][:coords].unshift({:x => @@all_snakes[key][:coords][0][:x], :y => @@all_snakes[key][:coords][0][:y] + 1})            
            elsif @@all_snakes[key][:direction] == 'ny'
              @@all_snakes[key][:prevdirection] = 'ny'
              @@all_snakes[key][:coords].unshift({:x => @@all_snakes[key][:coords][0][:x], :y => @@all_snakes[key][:coords][0][:y] - 1})
            end
          
            # snake collisions check
            @@all_snakes.each do |key2, value2|
              # other snakes
              if key != key2
                if @@all_snakes[key2][:coords].include? @@all_snakes[key][:coords][0]
                  puts "user #{key} collided with user #{key2}"
                  @@all_snakes[key][:dead] = true
                end
              # your snake
              else
                # puts @@all_snakes[key][:coords][1..-1]
                # puts "head:"
                # puts @@all_snakes[key][:coords][0]
                if @@all_snakes[key][:coords][1..-1].include? @@all_snakes[key][:coords][0]
                  puts "user #{key} collided with itself"
                  @@all_snakes[key][:dead] = true
                end
              end
            end

            # wall check
            if @@all_snakes[key][:coords][0][:x] < 0 || @@all_snakes[key][:coords][0][:x] > @@grid_max_x = 40 - 1
              puts "user #{key} hit an x wall"
              @@all_snakes[key][:dead] = true
            elsif @@all_snakes[key][:coords][0][:y] < 0 || @@all_snakes[key][:coords][0][:y] > @@grid_max_y = 40 - 1
              puts "user #{key} hit a y wall"
              @@all_snakes[key][:dead] = true
            end
          end

          # checks to see if head on food
          if @@food.include? @@all_snakes[key][:coords][0]
            @@food.delete(@@all_snakes[key][:coords][0])
            @@users[key][:score] += 1 

          else
            @@all_snakes[key][:coords].pop
          end

        end



        # generates food if less than number of snakes on board
        while @@food.length < @@all_snakes.length
          puts "in while loop trying to place food"
          randx = rand(1..@@grid_max_x - 1)
          randy = rand(1..@@grid_max_y - 1)
          new_food = {:x => randx, :y => randy}
          occupied = false

          @@all_snakes.each do |key, value|
            if @@all_snakes[key][:coords].include? new_food
              occupied = true
            end
          end

          if occupied == false
            @@food << new_food
            puts "making new food, all food: #{@@food}"
          end

        end


        ActionCable.server.broadcast("all_players", {:type => 'tick', :snakes => @@all_snakes, :users => @@users, :food => @@food}.to_json)
        sleep(0.25)
      end
    end
  end



end

